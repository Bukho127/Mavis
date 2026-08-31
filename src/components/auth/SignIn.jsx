import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, 
    CheckmarkBadge01Icon,
    Password
 } from "@hugeicons/core-free-icons";
import logo from "../../assets/logos/logo.svg";
import dashboardPreview from "../../assets/Background/dashboard-preview.svg";

function Login() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className="flex w-full items-center justify-center px-10 py-6 sm:w-1/2 sm:px-16 lg:px-24">
        <div className="w-full max-w-[420px]">
          <NavLink to="/" className="mb-8 inline-flex items-center gap-2">
            <img src={logo} alt="Mavis logo" className="h-8 w-auto" />
          </NavLink>

          <h1 className="mb-3 font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-4xl font-semibold text-[#17211f]">
            Welcome Back!
          </h1>
          <p className="font-['Avantt_Trial','Trebuchet_MS',sans-serif] mb-6 max-w-sm text-gray-600">
            Use Mavis to prepare for your next dream job in few minutes.
          </p>

          <form className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-3 rounded-sm border border-gray-300 px-4 py-3">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={18}
                className="text-gray-400"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3 rounded-sm border border-gray-300 px-4 py-3">
              {/* password */}
              <HugeiconsIcon
                icon={Password}
                size={18}
                className="text-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-black">
              OR
            </div>

            <button
              type="button"
              className="flex cursor-pointer items-center justify-center gap-3 rounded-sm border border-gray-300 px-4 py-3 text-sm font-medium text-[#17211f]"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt=""
                className="h-5 w-5"
              />
              Sign in with Google
            </button>

            <button
              type="submit"
              className="mt-2 cursor-pointer rounded-sm bg-[#0382F7] px-4 py-3 text-sm text-white"
            >
              Continue
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <NavLink to="/signup" className="font-medium text-[#4A7FF8]">
              Sign Up
            </NavLink>
          </p>
        </div>
      </div>

      <div className="relative hidden h-screen w-1/2 items-center justify-center overflow-hidden bg-[#011546] sm:flex">
        <div className="absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#17211f] shadow-md">
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            size={16}
            className="text-green-500"
          />
          Practice &amp; Compete
        </div>

        <img
          src={dashboardPreview}
          alt="Mavis dashboard preview"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default Login;
