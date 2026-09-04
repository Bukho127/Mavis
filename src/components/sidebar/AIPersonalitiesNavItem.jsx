import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";

function AIPersonalitiesNavItem() {
  return (
    <NavLink
      to="/dashboard/personalities"
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm no-underline ${
          isActive
            ? "bg-white text-stone-900 shadow-xs  border border-stone-200"
            : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      <HugeiconsIcon icon={SparklesIcon} size={17} />
      <span className="flex-1">AI Personalities</span>
      <span className="rounded bg-stone-200 border border-stone-300 px-1.5 py-0.5 text-[10px] text-stone-500">
        BETA
      </span>
    </NavLink>
  );
}

export default AIPersonalitiesNavItem;