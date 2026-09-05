import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { decodeUserIdFromToken, fetchUserProfile } from "../../api";

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

function InitialsGenerator() {
  const { token } = useAuth();
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!token) return;
    const userId = decodeUserIdFromToken(token);
    if (!userId) return;

    async function fetchProfile() {
      try {
        const data = await fetchUserProfile(userId, token);
        setUserName(data.full_name);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }

    fetchProfile();
  }, [token]);

  return (
    <div>
      <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-[#00897B] text-stone-50 cursor-pointer hover:bg-[#00695C]">
        {getInitials(userName)}
      </button>
    </div>
  );
}

export default InitialsGenerator;
