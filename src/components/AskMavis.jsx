import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";

function AskMavis() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // wait for expand transition before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: wire this up to your chatbot handler
    console.log("Sending to Mavis:", message);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center overflow-hidden rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${
          isOpen ? "w-[min(480px,90vw)] px-2 py-2" : "w-auto px-5 py-3"
        }`}
      >
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap font-semibold text-[#17211f]"
          >
            <HugeiconsIcon icon={Message01Icon} size={20} className="text-white bg-[#4A7FF8] rounded-full" />
            Ask Mavis
          </button>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Mavis anything..."
              className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-[#17211f] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A7FF8] text-white disabled:opacity-40"
              disabled={!message.trim()}
            >
              <HugeiconsIcon icon={SentIcon} size={16} />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setIsOpen(false);
                setMessage("");
              }}
              className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default AskMavis;