import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon } from "@hugeicons/core-free-icons";

function AppearanceNavItem() {
  return (
    <NavLink
      to="/dashboard/appearance"
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm no-underline ${
          isActive
            ? "bg-white text-stone-900 shadow-xs border border-stone-200"
            : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      <HugeiconsIcon icon={Sun01Icon} size={17} />
      <span className="flex-1">Appearance</span>
    </NavLink>
  );
}

export default AppearanceNavItem;