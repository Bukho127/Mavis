import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileSecurityIcon } from "@hugeicons/core-free-icons";

function PrivacyNavItem() {
  return (
    <NavLink
      to="/dashboard/privacy"
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm no-underline ${
          isActive
            ? "bg-white text-stone-900 shadow-xs border border-stone-200"
            : "text-stone-600 hover:bg-stone-100"
        }`
      }
    >
      <HugeiconsIcon icon={FileSecurityIcon} size={17} />
      <span className="flex-1">Privacy</span>
    </NavLink>
  );
}

export default PrivacyNavItem;