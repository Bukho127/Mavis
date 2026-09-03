import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase01Icon } from "@hugeicons/core-free-icons";

function JobTrackerNavItem() {
  return (
    <NavLink
      to="/dashboard/jobs"
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm no-underline ${
          isActive
            ? "bg-white border border-stone-200 text-stone-900 shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      <HugeiconsIcon icon={Briefcase01Icon} size={17} />
      <span className="flex-1">Job Tracker</span>
      <span className="rounded bg-stone-200 border border-stone-300 px-1.5 py-0.5 text-[10px] text-stone-500">
        BETA
      </span>
    </NavLink>
  );
}

export default JobTrackerNavItem;