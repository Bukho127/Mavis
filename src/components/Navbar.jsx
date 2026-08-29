import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";
import logo from "../assets/logos/logo.svg";

function Navbar() {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-4 text-black sm:px-[5vw]" aria-label="Main navigation">
      <NavLink className="inline-flex items-center bg-white px-2.5 py-1.5" to="/">
        <img className="block h-auto w-28" src={logo} alt="Mavis" />
      </NavLink>
      <div className="flex items-center gap-3 text-sm sm:gap-7">
        <NavLink className="no-underline" to="/#features">Features</NavLink>
        <NavLink className="no-underline" to="/#how-it-works">How it works</NavLink>
        <NavLink className="no-underline" to="/#pricing">Pricing</NavLink>
        <NavLink className="flex items-center gap-1" to="/resources">
          Resources
          <HugeiconsIcon icon={ChevronDownIcon} size={16} />
        </NavLink>
        <NavLink
          className="rounded-md bg-[#d1d1d1] px-4 py-1.5 text-black no-underline"
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
