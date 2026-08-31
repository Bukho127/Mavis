import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logos/logo.svg";
import ResourcesDropdown from "./ResourcesDropdown";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 40);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-[5vw] transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-black/40 text-white backdrop-blur-lg"
          : "bg-white text-black"
      }`}
      aria-label="Main navigation"
    >
      <NavLink className="inline-flex items-center px-2.5 py-1.5" to="/">
        <img
          className={`block h-auto w-28 transition-all duration-300 ${
            isScrolled ? "brightness-0 invert" : ""
          }`}
          src={logo}
          alt="Mavis"
        />
      </NavLink>
      <div className="flex items-center gap-3 text-sm sm:gap-7">
        <NavLink className="no-underline" to="/#features">
          Features
        </NavLink>
        <NavLink className="no-underline" to="/#how-it-works">
          How it works
        </NavLink>
        <NavLink className="no-underline" to="/#pricing">
          Pricing
        </NavLink>

        <ResourcesDropdown
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isScrolled={isScrolled}
        />

        <NavLink
          className={`rounded-md px-4 py-1.5 no-underline transition-colors duration-300 ${
            isScrolled ? "bg-white/15 text-white" : "bg-[#d1d1d1] text-black"
          }`}
          to="/login"
        >
          Login
        </NavLink>
        <NavLink
          className="rounded-md bg-[#4a7ff8] px-4 py-1.5 text-white no-underline"
          to="/start-interview"
        >
          Start interview
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;