import { HugeiconsIcon } from "@hugeicons/react";

import {
  Mic01Icon,
  MicOff01Icon,
  Video01Icon,
  VideoOffIcon,
  CallEnd04Icon,
} from "@hugeicons/core-free-icons";

import { useRoom } from "../../context/RoomContext";

function CallControls({ onEndCall }) {
  const {
    isConnected,
    isMuted,
    isVideoEnabled,
    error,
    toggleMute,
    toggleVideo,
    disconnect,
  } = useRoom();

  const handleEndCall = () => {
    disconnect();

    onEndCall?.();
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 px-4 py-4 text-sm text-stone-700">
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={toggleMute}
          disabled={!isConnected}
          aria-label={
            isMuted ? "Unmute" : "Mute"
          }
          className="cursor-pointer rounded-sm border border-stone-300 p-3 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
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
          className="cursor-pointer rounded-sm border border-stone-300 p-3 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
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
          className="flex cursor-pointer items-center gap-3 rounded-sm bg-red-600 p-3 text-white hover:bg-red-700"
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