import { useEffect, useRef } from "react";
import { useRoom } from "../../context/RoomContext";

function TranscriptView() {
  const { transcript } = useRoom();
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (transcript.length === 0) {
    return (
      <div className="flex h-full items-center justify-center border-t border-stone-300 px-4 py-4 text-center">
        <p className="text-sm text-stone-400">
          Your conversation will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4">
      {transcript.map((entry) => {
        const isCandidate = entry.speaker === "candidate";

        return (
          <div
            key={entry.id}
            className={`flex ${isCandidate ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                isCandidate
                  ? "bg-[#4A7FF8] text-white"
                  : "bg-stone-100 text-stone-900"
              }`}
            >
              <p className="mb-1 text-xs font-semibold opacity-70">
                {isCandidate ? "You" : "Mavis"}
              </p>
              <p>{entry.text}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default TranscriptView;