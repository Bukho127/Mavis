import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Download05Icon } from "@hugeicons/core-free-icons";

function scoreLabel(score) {
  if (typeof score !== "number") return "Pending";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Solid";
  if (score >= 40) return "Average";
  return "Needs work";
}

function scoreClass(score) {
  if (typeof score !== "number") return "bg-stone-100 text-stone-500";
  if (score >= 85) return "bg-emerald-100 text-emerald-700";
  if (score >= 70) return "bg-lime-100 text-lime-700";
  if (score >= 40) return "bg-orange-100 text-orange-700";
  return "bg-rose-100 text-rose-700";
}

function getStanding(score, interviewCount) {
  if (interviewCount === 1) return "Top 100%";
  if (typeof score !== "number") return "Pending";
  if (score >= 90) return "Top 10%";
  if (score >= 80) return "Top 20%";
  if (score >= 70) return "Top 35%";
  if (score >= 50) return "Top 60%";
  return "Top 90%";
}

function getSimilarRoleInterviewCount(interview) {
  return (
    interview.similarRoleInterviewCount ||
    interview.roleInterviewCount ||
    interview.benchmarkInterviewCount ||
    interview.standingSampleSize ||
    null
  );
}

function normalizeRole(interview) {
  return String(interview.jobTitle || interview.role || interview.title || "")
    .trim()
    .toLowerCase();
}

function countSimilarRoleInterviews(interview, allInterviews) {
  const backendCount = getSimilarRoleInterviewCount(interview);
  if (backendCount) return backendCount;

  const role = normalizeRole(interview);
  if (!role) return 1;

  return allInterviews.filter((candidate) => normalizeRole(candidate) === role).length || 1;
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecentFeedbackTable({ interviews = [], allInterviews = interviews }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-stone-950">Recent feedback</h2>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[minmax(180px,1.5fr)_120px_140px_140px_120px] gap-4 border-b border-stone-200 px-4 py-3 text-xs font-medium text-stone-500">
          <span>Interview role</span>
          <span>Date</span>
          <span>Overall score</span>
          <span>Standing</span>
          <span className="text-right">Action</span>
        </div>

        {interviews.length ? (
          <div className="divide-y divide-stone-100">
            {interviews.map((interview) => {
              const score = interview.feedback?.overallScore;
              const similarRoleInterviewCount = countSimilarRoleInterviews(interview, allInterviews);
              const interviewLabel = similarRoleInterviewCount === 1 ? "person" : "people";

              return (
                <div
                  key={interview._id || interview.id}
                  className="grid grid-cols-[minmax(180px,1.5fr)_120px_140px_140px_120px] items-center gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-stone-950">
                      {interview.jobTitle || interview.role || "Untitled interview"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {interview.status || "completed"}
                    </p>
                  </div>

                  <span className="text-stone-600">
                    {formatDate(interview.endedAt || interview.createdAt)}
                  </span>

                  <span>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${scoreClass(score)}`}>
                      {scoreLabel(score)}
                    </span>
                  </span>

                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      {getStanding(score, similarRoleInterviewCount)}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {similarRoleInterviewCount.toLocaleString()} {interviewLabel} interviewed
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50"
                      aria-label="Download feedback"
                    >
                      <HugeiconsIcon icon={Download05Icon} size={16} />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 text-rose-500 hover:bg-rose-50"
                      aria-label="Delete feedback"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-stone-500">
            Complete an interview to see feedback here.
          </p>
        )}
      </div>
    </section>
  );
}

export default RecentFeedbackTable;
