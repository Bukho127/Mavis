export const JOB_STATUSES = [
  {
    id: "saved",
    label: "Saved",
    helper: "Roles worth revisiting",
    dotClass: "bg-stone-400",
    badgeClass: "bg-stone-100 text-stone-700",
  },
  {
    id: "applied",
    label: "Applied",
    helper: "Waiting for a reply",
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-700",
  },
  {
    id: "screening",
    label: "Screening",
    helper: "Recruiter or phone stage",
    dotClass: "bg-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "interviewing",
    label: "Interviewing",
    helper: "Prep and follow-ups",
    dotClass: "bg-orange-500",
    badgeClass: "bg-orange-50 text-orange-700",
  },
  {
    id: "offer",
    label: "Offer",
    helper: "Decision and negotiation",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "closed",
    label: "Closed",
    helper: "Not moving forward",
    dotClass: "bg-rose-400",
    badgeClass: "bg-rose-50 text-rose-700",
  },
];

export const JOB_STATUS_IDS = JOB_STATUSES.map((status) => status.id);

export function getJobStatus(statusId) {
  return (
    JOB_STATUSES.find((status) => status.id === statusId) || JOB_STATUSES[0]
  );
}

export function formatJobDate(value) {
  if (!value) return "No date";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
