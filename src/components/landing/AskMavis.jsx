import { useState, useRef, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { streamMarketingChat } from "../../api"; // adjust path to wherever you saved it

function AskMavis() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]); // { role: "user" | "assistant", content: string }
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // cancel any in-flight stream if the widget closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      abortControllerRef.current?.abort();
    }
    return () => abortControllerRef.current?.abort();
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setMessage("");
      setHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "" }, // placeholder to stream into
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await streamMarketingChat(
          trimmed,
          (chunk) => {
            setHistory((prev) => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + chunk,
              };
              return updated;
            });
          },
          { signal: controller.signal }
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Chat stream failed:", err);
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [message, isStreaming]
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && history.length > 0 && (
        <div className="mb-3 flex max-h-96 w-[min(480px,90vw)] flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-lg">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "self-end bg-[#4A7FF8] text-white"
                  : "self-start bg-gray-100 text-[#17211f]"
              }`}
            >
              {msg.content || (msg.role === "assistant" && isStreaming ? "…" : "")}
            </div>
          ))}
          {error && (
            <p className="self-start text-xs text-red-500">{error}</p>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

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
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap font-semibold text-[#17211f]"
          >
            <HugeiconsIcon
              icon={Message01Icon}
              size={20}
              className="rounded-full bg-[#4A7FF8] text-white"
            />
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
              disabled={isStreaming}
              className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-[#17211f] outline-none placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A7FF8] text-white disabled:opacity-40"
              disabled={!message.trim() || isStreaming}
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