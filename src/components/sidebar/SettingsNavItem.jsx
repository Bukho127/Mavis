import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  InformationCircleIcon,
  LanguageCircleIcon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";

function SettingsNavItem() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={menuRef} className="relative z-50">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm ${
          isOpen || location.pathname === "/dashboard/settings"
            ? "border border-stone-200 bg-white text-stone-900 shadow-xs"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <HugeiconsIcon icon={Settings01Icon} size={17} />
        <span className="flex-1 text-left">Settings</span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Settings options"
          className="absolute bottom-full left-0 z-[100] mb-2 w-full min-w-60 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/20"
        >
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-semibold text-stone-900">Settings</p>
          </div>

          <div className="p-2">
            <label className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-stone-100">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                <HugeiconsIcon icon={LanguageCircleIcon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-stone-800">Language</span>
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="Language"
                className="max-w-24 rounded-md border border-stone-200 bg-white px-1.5 py-1 text-xs text-stone-700 outline-none focus:border-stone-400"
              >
                <option>English</option>
                <option>isiXhosa</option>
                <option>Afrikaans</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-stone-100"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                <HugeiconsIcon icon={InformationCircleIcon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-stone-800">Learn more</span>
              </span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={15} className="text-stone-400" />
            </button>
          </div>

          <div className="border-t border-stone-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-red-600 hover:bg-red-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <HugeiconsIcon icon={Logout01Icon} size={18} />
              </span>
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsNavItem;