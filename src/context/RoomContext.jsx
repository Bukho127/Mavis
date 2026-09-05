import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

const RoomContext = createContext(null);

export function RoomProvider({
  token,
  serverUrl,
  children,
}) {
  const roomRef = useRef(null);
  const audioContainerRef = useRef(null);

  const [isConnected, setIsConnected] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isVideoEnabled, setIsVideoEnabled] =
    useState(false);

  const [canPlaybackAudio, setCanPlaybackAudio] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    if (!token || !serverUrl) {
      return;
    }

    const room = new Room();

    roomRef.current = room;

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Remote audio tracks (e.g. Mavis's voice) are delivered by LiveKit but
    // never played automatically on web — they must be explicitly attached
    // to a real <audio> element for sound to actually come out.
    const handleTrackSubscribed = (track) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = track.attach();
        audioElement.autoplay = true;
        audioContainerRef.current?.appendChild(audioElement);
      }
    };

    const handleTrackUnsubscribed = (track) => {
      track.detach().forEach((el) => el.remove());
    };

    // Browsers can silently block that autoplay attempt with no error at
    // all. LiveKit reports this via canPlaybackAudio so the UI can show a
    // "click to enable sound" affordance instead of failing invisibly.
    const handleAudioPlaybackChanged = () => {
      setCanPlaybackAudio(room.canPlaybackAudio);
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackChanged);

    let cancelled = false;

    async function connect() {
      try {
        await room.connect(
          serverUrl,
          token
        );

        if (cancelled) {
          room.disconnect();
          return;
        }

        setIsConnected(true);
        setError(null);
        setCanPlaybackAudio(room.canPlaybackAudio);

        // Immediately request mic access on connect, rather than waiting
        // for the user's first manual toggle click. This is the point
        // where the browser's native permission prompt appears.
        try {
          await room.localParticipant.setMicrophoneEnabled(true);

          if (!cancelled) {
            setIsMuted(false);
          }
        } catch (permissionErr) {
          console.error(
            "Microphone permission denied or unavailable:",
            permissionErr
          );

          if (!cancelled) {
            setIsMuted(true);
            setError(
              "Microphone access is required for the interview. Please allow microphone access in your browser and try again."
            );
          }
        }
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to connect to LiveKit room:",
          err
        );

        setIsConnected(false);

        setError(
          err.message ||
            "Failed to connect to LiveKit."
        );
      }
    }

    connect();

    return () => {
      cancelled = true;

      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackChanged);

      room.disconnect();

      if (roomRef.current === room) {
        roomRef.current = null;
      }

      setIsConnected(false);
      setIsMuted(false);
      setIsVideoEnabled(false);
      setCanPlaybackAudio(true);
    };
  }, [token, serverUrl]);

  const toggleMute = useCallback(
    async () => {
      const room = roomRef.current;

      if (!room || !isConnected) {
        return;
      }

      try {
        const nextMuted = !isMuted;

        await room.localParticipant.setMicrophoneEnabled(
          !nextMuted
        );

        setIsMuted(nextMuted);
        setError(null);
      } catch (err) {
        console.error(
          "Failed to toggle microphone:",
          err
        );

        setError(
          "Couldn't access your microphone. Please check your browser permissions."
        );
      }
    },
    [isMuted, isConnected]
  );

  const toggleVideo = useCallback(
    async () => {
      const room = roomRef.current;

      if (!room || !isConnected) {
        return;
      }

      try {
        const nextEnabled =
          !isVideoEnabled;

        await room.localParticipant.setCameraEnabled(
          nextEnabled
        );

        setIsVideoEnabled(nextEnabled);
        setError(null);
      } catch (err) {
        console.error(
          "Failed to toggle camera:",
          err
        );

        setError(
          "Couldn't access your camera. Please check your browser permissions."
        );
      }
    },
    [isVideoEnabled, isConnected]
  );

  // Must be called directly from a click/tap handler — browsers require a
  // genuine user gesture to unblock audio, so this can't be triggered
  // automatically from useEffect or a .then() chain.
  const startAudio = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.startAudio();
      setCanPlaybackAudio(true);
    } catch (err) {
      console.error("Failed to start audio playback:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
  }, []);

  const value = {
    isConnected,
    isMuted,
    isVideoEnabled,
    canPlaybackAudio,
    error,
    toggleMute,
    toggleVideo,
    disconnect,
    startAudio,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
      {/* Invisible container that holds attached remote <audio> elements */}
      <div ref={audioContainerRef} style={{ display: "none" }} />
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error(
      "useRoom must be used within a RoomProvider"
    );
  }

  return context;
}
