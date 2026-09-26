import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Cancel01Icon,
  FileSecurityIcon,
  Loading03Icon,
  Mail01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";
import { decodeUserIdFromToken, fetchUserProfile, resolveApiUrl } from "../../api";

const PROFILE_UPDATED_EVENT = "mavis:profile-updated";

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 1);
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAvatarUrl(profile) {
  return resolveApiUrl(
    profile?.avatar_url ||
      profile?.avatarUrl ||
      profile?.profileAvatarUrl ||
      profile?.profile_avatar_url ||
      profile?.avatar ||
      profile?.profileImage ||
      profile?.profile_image ||
      null,
  );
}

function InitialsGenerator() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return undefined;
    }

    const userId = decodeUserIdFromToken(token);
    if (!userId) {
      return undefined;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserProfile(userId, token);
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load user profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnPointerDown = (event) => {
      if (!popoverRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    const updateProfile = (event) => {
      if (event.detail?.profile) setProfile(event.detail.profile);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, updateProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, updateProfile);
  }, []);

  const fullName = profile?.full_name || profile?.name || "Your profile";
  const email = profile?.email || "No email connected";
  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const joinedDate = formatDate(profile?.createdAt || profile?.created_at);
  const avatarUrl = getAvatarUrl(profile);
  const openSettings = () => {
    setIsOpen(false);
    navigate("/dashboard/settings");
  };

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        aria-label="Open profile"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Profile"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-300 bg-[#00897B] text-stone-50 hover:bg-[#00695C]"
      >
        {loading ? (
          <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Profile details"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl shadow-stone-900/15"
        >
          <div className="flex items-start justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                Profile
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-950">
                Mavis account
              </p>
            </div>

            <button
              type="button"
              aria-label="Close profile"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={17} />
            </button>
          </div>

          <div className="p-3">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-stone-50 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00897B] font-semibold text-white">
                {loading ? (
                  <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-950">
                  {loading ? "Loading profile" : fullName}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {loading ? "Fetching account details..." : email}
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            ) : (
              <div className="grid gap-2">
                <ProfilePopoverRow
                  icon={UserIcon}
                  label="Name"
                  value={loading ? "Loading..." : fullName}
                />
                <ProfilePopoverRow
                  icon={Mail01Icon}
                  label="Email"
                  value={loading ? "Loading..." : email}
                />
                <ProfilePopoverRow
                  icon={Calendar03Icon}
                  label="Joined"
                  value={loading ? "Loading..." : joinedDate}
                />
                <ProfilePopoverRow
                  icon={FileSecurityIcon}
                  label="Status"
                  value="Protected workspace"
                />
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 p-2">
            <button
              type="button"
              onClick={openSettings}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-stone-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                <HugeiconsIcon icon={Settings01Icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-stone-900">
                  Settings
                </span>
                <span className="block truncate text-xs text-stone-400">
                  Manage profile preferences
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePopoverRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-stone-50">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
        <HugeiconsIcon icon={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-stone-400">{label}</span>
        <span className="block truncate text-sm font-medium text-stone-900">
          {value}
        </span>
      </span>
    </div>
  );
}

export default InitialsGenerator;
