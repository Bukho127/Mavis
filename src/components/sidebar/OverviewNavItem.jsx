import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridViewIcon } from "@hugeicons/core-free-icons";

function OverviewNavItem() {
  return (
    <NavLink
      to="/dashboard"
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm no-underline ${
          isActive
            ? "bg-white text-stone-900 shadow-xs border border-stone-200"
            : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      <HugeiconsIcon icon={GridViewIcon} size={17} />
      Overview
    </NavLink>
  );
}

export default OverviewNavItem;
