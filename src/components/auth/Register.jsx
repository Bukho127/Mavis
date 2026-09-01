import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Profile02Icon,
  Mail01Icon,
  CheckmarkBadge01Icon,
  Password,
} from "@hugeicons/core-free-icons";
import logo from "../../assets/logos/logo.svg";
import dashboardPreview from "../../assets/Background/dashboard-preview.svg";
import { useState } from "react";

function Register({ onRegister, onGoogleLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    if (!onRegister) return;

    setIsSubmitting(true);
    try {
      await onRegister(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
            <div>
              <div
                className={`flex items-center gap-3 rounded-sm border px-4 py-3 ${
                  errors.fullName ? "border-red-400" : "border-gray-300"
                }`}
              >
                <HugeiconsIcon
                  icon={Profile02Icon}
                  size={18}
                  className="text-gray-400"
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <div
                className={`flex items-center gap-3 rounded-sm border px-4 py-3 ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={18}
                  className="text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <div
                className={`flex items-center gap-3 rounded-sm border px-4 py-3 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
              >
                <HugeiconsIcon
                  icon={Password}
                  size={18}
                  className="text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-black">
              OR
            </div>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={isSubmitting}
              className="flex cursor-pointer items-center justify-center gap-3 rounded-sm border border-gray-300 px-4 py-3 text-sm font-medium text-[#17211f] disabled:opacity-50"
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
              disabled={isSubmitting}
              className="mt-2 cursor-pointer rounded-sm bg-[#0382F7] px-4 py-3 text-sm text-white disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Continue"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <NavLink to="/login" className="font-medium text-[#4A7FF8]">
              Sign In
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

export default Register;