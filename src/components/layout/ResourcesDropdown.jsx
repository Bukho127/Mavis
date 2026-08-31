// ResourcesDropdown.jsx
import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  Note01Icon,
  Book02Icon,
  File01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";

const resourceLinks = [
  { label: "Blog", to: "/resources/blog", icon: Note01Icon },
  { label: "Guides", to: "/resources/guides", icon: Book02Icon },
  { label: "Interview Bank", to: "/resources/interview-bank", icon: File01Icon },
  { label: "FAQs", to: "/resources/faqs", icon: HelpCircleIcon },
];

function ResourcesDropdown({ isOpen, setIsOpen, isScrolled }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 bg-transparent"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Resources
        <HugeiconsIcon
          icon={ChevronDownIcon}
          size={16}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-md border p-2 shadow-lg transition-all duration-200 ${
            isScrolled
              ? "border-white/10 bg-black/80 text-white backdrop-blur-lg"
              : "border-black/10 bg-white text-black"
          }`}
        >
          {resourceLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-3 py-2 no-underline transition-colors duration-150 ${
                  isActive
                    ? isScrolled
                      ? "bg-white/15"
                      : "bg-black/10"
                    : isScrolled
                      ? "hover:bg-white/10"
                      : "hover:bg-black/5"
                }`
              }
            >
              <HugeiconsIcon icon={link.icon} size={18} strokeWidth={1.8} />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourcesDropdown;