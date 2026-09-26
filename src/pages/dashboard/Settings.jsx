import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Loading03Icon,
  Mail01Icon,
  Upload01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  decodeUserIdFromToken,
  deleteUserAvatar,
  deleteUserProfile,
  fetchUserProfile,
  resolveApiUrl,
  updateUserProfile,
  uploadUserAvatar,
} from "../../api";
import { useAuth } from "../../context/AuthContext";

const PROFILE_UPDATED_EVENT = "mavis:profile-updated";

function getInitial(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 1);
}

function getAvatarUrl(profile) {
  return (
    profile?.avatar_url ||
    profile?.avatarUrl ||
    profile?.profileAvatarUrl ||
    profile?.profile_avatar_url ||
    profile?.avatar ||
    profile?.profileImage ||
    profile?.profile_image ||
    null
  );
}

function notifyProfileUpdated(profile) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { profile } }),
  );
}

function Settings() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = token ? decodeUserIdFromToken(token) : null;

  const [profile, setProfile] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [loading, setLoading] = useState(Boolean(token && userId));
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token || !userId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserProfile(userId, token);
        const fullName = data.full_name || data.name || "";

        if (isMounted) {
          setProfile(data);
          setDraftName(fullName);
          notifyProfileUpdated(data);
        }
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
  const email = profile?.email || "";
  const avatarUrl = resolveApiUrl(getAvatarUrl(profile));
  const initial = useMemo(() => getInitial(draftName || fullName), [draftName, fullName]);
  const hasNameChange = Boolean(draftName.trim() && draftName.trim() !== fullName);
  const authError = !token || !userId ? "Sign in to manage your settings." : null;
  const isBusy = loading || saving || uploadingAvatar || deletingAvatar || deletingAccount;

  const updateProfileState = (nextProfile) => {
    const mergedProfile = { ...(profile || {}), ...(nextProfile || {}) };

    setProfile(mergedProfile);
    setDraftName(mergedProfile.full_name || mergedProfile.name || "");
    notifyProfileUpdated(mergedProfile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token || !userId || !hasNameChange) return;

    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      const updatedProfile = await updateUserProfile(userId, token, {
        full_name: draftName.trim(),
      });

      updateProfileState(updatedProfile);
      setNotice("Profile saved.");
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !token || !userId) return;

    try {
      setUploadingAvatar(true);
      setError(null);
      setNotice(null);
      const updatedProfile = await uploadUserAvatar({
        token,
        file,
        method: avatarUrl ? "PATCH" : "POST",
      });

      updateProfileState(updatedProfile);
      setNotice("Profile image updated.");
    } catch (err) {
      setError(err.message || "Could not upload your profile image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!token || !userId || deletingAvatar) return;

    try {
      setDeletingAvatar(true);
      setError(null);
      setNotice(null);
      const updatedProfile = await deleteUserAvatar(token);
      const profileWithoutAvatar = {
        ...updatedProfile,
        avatar: null,
        avatarUrl: null,
        avatar_url: null,
        profileAvatarUrl: null,
        profile_avatar_url: null,
        profileImage: null,
        profile_image: null,
      };

      updateProfileState(profileWithoutAvatar);
      setNotice("Profile image removed.");
    } catch (err) {
      setError(err.message || "Could not delete your profile image.");
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || !userId || deletingAccount) return;

    const confirmed = window.confirm(
      "Delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setDeletingAccount(true);
      setError(null);
      setNotice(null);
      await deleteUserProfile(token);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Could not delete your account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <section className="min-h-full bg-stone-100 px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <header>
          <h2 className="text-2xl font-semibold text-stone-950">Your profile</h2>
          <div className="mt-10 h-px bg-stone-300" />
        </header>

        {authError ? (
          <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {authError}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
              <AvatarPreview
                avatarUrl={avatarUrl}
                initial={initial}
                loading={loading || uploadingAvatar || deletingAvatar}
              />

              <div className="flex items-center gap-3 md:pt-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0B84FF] px-4 text-sm font-medium text-white hover:bg-[#0974df] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Upload01Icon} size={16} />
                  {uploadingAvatar ? "Uploading..." : "Upload new image"}
                </button>

                <button
                  type="button"
                  disabled={isBusy || !avatarUrl}
                  onClick={handleDeleteAvatar}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 bg-stone-50 px-4 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingAvatar ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {(error || notice) && (
              <div
                className={`mb-6 max-w-md rounded-md border px-3 py-2 text-sm ${
                  error
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {error || notice}
              </div>
            )}

            <div className="max-w-md space-y-8">
              <SettingsField
                disabled={loading || saving}
                helper="The name associated with this account"
                icon={UserIcon}
                label="Name"
                onChange={setDraftName}
                value={loading ? "" : draftName}
              />

              <SettingsField
                disabled
                helper="The email associated with this account"
                icon={Mail01Icon}
                label="Email"
                value={loading ? "" : email}
              />

              <div>
                <button
                  type="submit"
                  disabled={!hasNameChange || isBusy}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#60A5FA] px-4 text-sm font-medium text-white hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="mt-12 border-t border-stone-300 pt-5">
              <h3 className="text-base font-medium text-stone-950">Account Deletion</h3>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleDeleteAccount}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
                {deletingAccount ? "Deleting account..." : "Delete account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function AvatarPreview({ avatarUrl, initial, loading }) {
  return (
    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] bg-[#00897B] text-6xl font-normal text-white">
      {loading ? (
        <HugeiconsIcon icon={Loading03Icon} size={34} className="animate-spin" />
      ) : avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
}

function SettingsField({
  disabled = false,
  helper,
  icon,
  label,
  onChange,
  value,
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-stone-950">{label}</span>
      <span className="mt-1 block text-sm text-stone-500">{helper}</span>
      <span className="mt-2 flex h-9 items-center rounded-md border border-stone-300 bg-stone-100 px-2 text-stone-500 focus-within:border-stone-400 focus-within:bg-white">
        <HugeiconsIcon icon={icon} size={17} className="shrink-0" />
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 disabled:text-stone-400"
        />
      </span>
    </label>
  );
}

export default Settings;
