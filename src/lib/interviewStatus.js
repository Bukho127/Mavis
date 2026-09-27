export const COMPLETED_INTERVIEW_STATUS = "completed";

const INCOMPLETE_STATUS_LABELS = {
  cancelled: "Not completed",
  abandoned: "Not completed",
  interrupted: "Not completed",
  in_progress: "In progress",
};

export function isCompletedInterview(interview) {
  return interview?.status === COMPLETED_INTERVIEW_STATUS;
}

export function getInterviewStatusLabel(interview) {
  const status = interview?.status;
  if (status === COMPLETED_INTERVIEW_STATUS) return "Completed";
  return INCOMPLETE_STATUS_LABELS[status] || "No evaluation";
}

export function hasCompletedFeedback(interview) {
  return isCompletedInterview(interview) && Boolean(interview?.feedback);
}
