import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Mic01Icon,
  ViewIcon,
  PlusSignCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { fetchAllInterviews } from "../../api";
import { useAuth } from "../../context/AuthContext";

const CommandMenu = ({ open, setOpen }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setValue("");
      return;
    }

    let isMounted = true;

    const loadInterviews = async () => {
      if (!token) {
        if (isMounted) {
          setError("Sign in to search your interviews");
          setInterviews([]);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const results = await fetchAllInterviews(token);
        if (isMounted) {
          setInterviews(Array.isArray(results) ? results : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load interviews");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInterviews();

    return () => {
      isMounted = false;
    };
  }, [open, token]);

  const normalizedQuery = value.trim().toLowerCase();

  const handleSelectInterview = (interview) => {
    setOpen(false);
    navigate("/dashboard/feedback", {
      state: { selectedInterview: interview },
    });
  };

  const filteredInterviews = !normalizedQuery
    ? interviews.slice(0, 6)
    : interviews
        .filter((interview) => {
          const role = String(interview.role ?? "").toLowerCase();
          const date = String(interview.date ?? "").toLowerCase();
          return (
            role.includes(normalizedQuery) || date.includes(normalizedQuery)
          );
        })
        .slice(0, 8);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Menu"
      className="fixed inset-0 z-50 bg-stone-950/8 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-12 w-full max-w-lg  overflow-hidden rounded-lg border border-stone-300 bg-white shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-stone-200 px-3">
        <HugeiconsIcon 
        icon={Search01Icon}
        className="text-stone-500"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="Search interviews by role or date"
          className="relative w-full border-b border-stone-200 p-3 text-lg text-stone-950 placeholder:text-stone-400 focus:outline-none"
        />
        </div>
        <div>
          {loading && (
            <div className="flex items-center gap-2 p-3 text-sm text-stone-500">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="animate-spin"
              />
              Searching interviews...
            </div>
          )}

          {!loading && error && (
            <div className="p-3 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && filteredInterviews.length > 0 && (
            <div className="mb-2 p-3">
              <p className="mb-2 text-sm text-stone-400">
                {normalizedQuery ? "Matching interviews" : "Recent interviews"}
              </p>
              {filteredInterviews.map((interview) => (
                <button
                  key={interview.id}
                  type="button"
                  onClick={() => handleSelectInterview(interview)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded p-2 text-left text-sm text-stone-950 transition-colors hover:bg-stone-100"
                >
                  <HugeiconsIcon
                    icon={Mic01Icon}
                    size={16}
                    className="shrink-0 text-[#4A7FF8]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-950">
                        {interview.role}
                      </span>
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-stone-500">
                        {interview.standing || "Completed"}
                      </span>
                    </div>
                    <p className="truncate text-xs text-stone-500">
                      {interview.date || "Date unavailable"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && filteredInterviews.length === 0 && (
            <div className="p-3 text-sm text-stone-500">
              No interview matches for{" "}
              <span className="font-medium text-stone-700">"{value}"</span>
            </div>
          )}

          <div className="border-t border-stone-200 p-3">
            <p className="mb-2 text-sm text-stone-400">Quick actions</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/interview");
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded p-2 text-left text-sm text-stone-950 transition-colors hover:bg-stone-100"
            >
              <HugeiconsIcon icon={PlusSignCircleIcon} size={16} />
              Start New Interview
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/feedback");
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded p-2 text-left text-sm text-stone-950 transition-colors hover:bg-stone-100"
            >
              <HugeiconsIcon icon={ViewIcon} size={16} />
              View All Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
