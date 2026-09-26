import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  FileSecurityIcon,
  Loading03Icon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { decodeUserIdFromToken, fetchUserProfile } from "../../api";
import { useAuth } from "../../context/AuthContext";

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Profile() {
  const { token } = useAuth();
  const userId = token ? decodeUserIdFromToken(token) : null;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(token && userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token || !userId) {
        setLoading(false);
        setError("Sign in to view your profile.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserProfile(userId, token);

        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Could not load your profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, userId]);

  const fullName = profile?.full_name || profile?.name || "Your profile";
  const email = profile?.email || "No email connected";
  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const joinedDate = formatDate(profile?.createdAt || profile?.created_at);

  return (
    <section className="min-h-full bg-stone-100 px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-stone-500">Account</p>
          <h2 className="mt-1 text-2xl font-semibold text-stone-950">Profile</h2>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#00897B] text-xl font-semibold text-white">
              {loading ? (
                <HugeiconsIcon icon={Loading03Icon} size={22} className="animate-spin" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-stone-950">
                {loading ? "Loading profile" : fullName}
              </h3>
              <p className="mt-1 truncate text-sm text-stone-500">
                {loading ? "Fetching account details..." : email}
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ProfileDetail icon={UserIcon} label="Name" value={fullName} loading={loading} />
              <ProfileDetail icon={Mail01Icon} label="Email" value={email} loading={loading} />
              <ProfileDetail
                icon={Calendar03Icon}
                label="Joined"
                value={joinedDate}
                loading={loading}
              />
              <ProfileDetail
                icon={FileSecurityIcon}
                label="Status"
                value="Protected workspace"
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileDetail({ icon, label, value, loading }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-stone-600">
        <HugeiconsIcon icon={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-stone-400">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-stone-900">
          {loading ? "Loading..." : value}
        </span>
      </span>
    </div>
  );
}

export default Profile;
