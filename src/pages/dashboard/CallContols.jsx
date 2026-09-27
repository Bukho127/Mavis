import { HugeiconsIcon } from "@hugeicons/react";

import {
  Mic01Icon,
  MicOff01Icon,
  Video01Icon,
  VideoOffIcon,
  CallEnd04Icon,
} from "@hugeicons/core-free-icons";

import { useRoom } from "../../context/RoomContext";

function getFinalTranscriptPayload(transcript) {
  const seenIds = new Set();

  return transcript
    .filter((entry) => {
      const text = entry?.text?.trim();
      if (!text || entry.final !== true || seenIds.has(entry.id)) return false;

      seenIds.add(entry.id);
      return true;
    })
    .map((entry) => ({
      id: entry.id,
      speaker: entry.speaker,
      text: entry.text.trim(),
      timestamp: entry.timestamp,
    }));
}

function CallControls({ onEndCall }) {
  const {
    isConnected,
    isMuted,
    isVideoEnabled,
    error,
    transcript,
    toggleMute,
    toggleVideo,
  } = useRoom();

  const handleEndCall = () => {
    onEndCall?.(getFinalTranscriptPayload(transcript), "completed");
  };

  return (
    <div className="flex w-full flex-col items-center gap-3 px-8 py-4 text-sm text-stone-700">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
        <button
          type="button"
          onClick={toggleMute}
          disabled={!isConnected}
          aria-label={
            isMuted ? "Unmute" : "Mute"
          }
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HugeiconsIcon
            icon={
              isMuted
                ? MicOff01Icon
                : Mic01Icon
            }
            size={20}
          />
        </button>

        <button
          type="button"
          onClick={toggleVideo}
          disabled={!isConnected}
          aria-label={
            isVideoEnabled
              ? "Turn off video"
              : "Turn on video"
          }
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HugeiconsIcon
            icon={
              isVideoEnabled
                ? Video01Icon
                : VideoOffIcon
            }
            size={20}
          />
        </button>

        <button
          type="button"
          onClick={handleEndCall}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 text-white hover:bg-red-700"
        >
          <HugeiconsIcon
            icon={CallEnd04Icon}
            size={20}
          />

          End session
        </button>
      </div>
    </div>
  );
}

export default CallControls;
