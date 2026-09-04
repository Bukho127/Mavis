import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

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

function decodeUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

function InitialsGenerator() {
  const { token } = useAuth();
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!token) return;
    const userId = decodeUserIdFromToken(token);
    if (!userId) return;


    //this is temporary this belongs in the api service layer, but for now we will just fetch the user profile directly here
    async function fetchProfile() {
      try {
        const res = await fetch(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        console.log("User profile response:", data);
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
