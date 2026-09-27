import { useEffect, useRef } from "react";
import { useRoom } from "../../context/RoomContext";

function TranscriptView() {
  const { displayTranscript } = useRoom();
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayTranscript]);

  if (displayTranscript.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-5 py-6 text-center">
        <p className="text-sm text-stone-400">
          Your conversation will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto bg-white px-5 py-5">
      {displayTranscript.map((entry) => {
        const isCandidate = entry.speaker === "candidate";

        return (
          <div
            key={entry.id}
            className={`flex ${isCandidate ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                isCandidate
                  ? "bg-[#4A7FF8] text-white"
                  : "border border-stone-200 bg-stone-50 text-stone-900"
              } ${entry.final ? "" : "opacity-70"}`}
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
