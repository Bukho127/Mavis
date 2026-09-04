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

function InitialsGenerator() {
  const { user } = useAuth();

  return (
    <div>
      <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-[#00897B] text-stone-50 cursor-pointer hover:bg-[#00695C]">
        {getInitials(user?.name)}
      </button>
    </div>
  );
}

export default InitialsGenerator;