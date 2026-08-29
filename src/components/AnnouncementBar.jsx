import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

function AnnouncementBar({
  message = "Get 3 free mock interviews this week — no card required.",
  ctaLabel = "Try it free",
  ctaHref = "#start",
  dismissible = true,
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative flex w-full items-center justify-center gap-3 bg-[#011546] px-4 py-2 text-sm text-white">
      <p className="text-center">
        {message}{" "}
        {ctaHref && (
          <a href={ctaHref} className="ml-1 font-semibold underline underline-offset-2">
            {ctaLabel}
          </a>
        )}
      </p>

      {dismissible && (
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss announcement"
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </button>
      )}
    </div>
  );
}

export default AnnouncementBar;