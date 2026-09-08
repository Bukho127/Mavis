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

  const [localAudioTrack, setLocalAudioTrack] =
    useState(null);

  const [canPlaybackAudio, setCanPlaybackAudio] =
    useState(true);

  const [error, setError] =
    useState(null);

  // Live transcript, rendered as a message-bubble conversation. Each entry:
  // { id, speaker: "candidate" | "mavis", text, timestamp }
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    if (!token || !serverUrl) {
      return;
    }

    const room = new Room();

    roomRef.current = room;

    const handleDisconnected = () => {
      setIsConnected(false);
      setLocalAudioTrack(null);
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

    const processedTranscriptStreams = new Set();
    const recentTranscriptMessages = new Map();

    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.AudioPlaybackStatusChanged, handleAudioPlaybackChanged);

    // The agent's inputAudioTranscription/outputAudioTranscription settings
    // publish both sides of the conversation as LiveKit text streams on the
    // "lk.transcription" topic. Each stream corresponds to one finished turn
    // of speech, so we read it fully, then add it as one chat bubble.
    room.registerTextStreamHandler("lk.transcription", async (reader, participantInfo) => {
      try {
        const text = await reader.readAll();
        const normalizedText = text?.trim().replace(/\s+/g, " ");
        if (!normalizedText) return;

        const streamId =
          reader.info?.id ||
          reader.info?.streamId ||
          reader.id;

        if (streamId && processedTranscriptStreams.has(streamId)) {
          return;
        }

        if (streamId) {
          processedTranscriptStreams.add(streamId);
        }

        const isLocalCandidate =
          participantInfo.identity === room.localParticipant.identity;
        const speaker = isLocalCandidate ? "candidate" : "mavis";
        const messageKey = `${participantInfo.identity}:${speaker}:${normalizedText}`;
        const now = Date.now();
        const lastSeenAt = recentTranscriptMessages.get(messageKey);

        // Some LiveKit/agent configurations can replay a completed stream.
        // Ignore only an immediate exact replay so repeated answers later remain valid.
        if (lastSeenAt && now - lastSeenAt < 5000) {
          return;
        }

        recentTranscriptMessages.set(messageKey, now);
        for (const [key, timestamp] of recentTranscriptMessages) {
          if (now - timestamp >= 10000) {
            recentTranscriptMessages.delete(key);
          }
        }

        setTranscript((prev) => [
          ...prev,
          {
            id: `${participantInfo.identity}-${Date.now()}-${Math.random()}`,
            speaker,
            text: normalizedText,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error("Failed to read transcription stream:", err);
      }
    });

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
            setLocalAudioTrack(
              room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track || null,
            );
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
      setLocalAudioTrack(null);
      setCanPlaybackAudio(true);
      setTranscript([]);
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
        setLocalAudioTrack(
          room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track || null,
        );
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
    localAudioTrack,
    canPlaybackAudio,
    error,
    transcript,
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