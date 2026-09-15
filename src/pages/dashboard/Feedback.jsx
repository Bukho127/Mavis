import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Loading03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { fetchAllInterviews, getInterviewById } from "../../api";
import { useAuth } from "../../context/AuthContext";

function getInterviewId(interview) {
  return interview?._id || interview?.id || interview?.interviewId;
}

function getInterviewTitle(interview) {
  return (
    interview?.jobTitle ||
    interview?.role ||
    interview?.title ||
    "Untitled interview"
  );
}

function getInterviewDate(interview) {
  return (
    interview?.endedAt ||
    interview?.createdAt ||
    interview?.updatedAt ||
    interview?.date ||
    null
  );
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

function normalizeInterviews(data) {
  const interviews = Array.isArray(data)
    ? data
    : data?.interviews || data?.data || [];

  return [...interviews].sort((a, b) => {
    const aTime = new Date(getInterviewDate(a) || 0).getTime();
    const bTime = new Date(getInterviewDate(b) || 0).getTime();
    return bTime - aTime;
  });
}

function getFeedback(interview) {
  const feedback = interview?.feedback;
  if (!feedback || typeof feedback !== "object") return null;

  const hasContent =
    feedback.summary ||
    feedback.overallScore ||
    feedback.strengths?.length ||
    feedback.weaknesses?.length ||
    Object.values(feedback.dimensionScores || {}).some(
      (score) => typeof score === "number",
    );

  return hasContent ? feedback : null;
}

function getScoreValue(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return Math.round(score);
}

function scoreToStatus(score) {
  const value = getScoreValue(score);
  if (value === null) return "Pending";
  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 40) return "Developing";
  return "Needs work";
}

function getStatusClass(status) {
  if (status === "Excellent" || status === "Good")
    return "bg-teal-50 text-teal-700";
  if (status === "Developing") 
    return "bg-sky-50 text-sky-700";
  if (status === "Needs work") 
    return "bg-rose-50 text-rose-700";
  return "bg-stone-100 text-stone-500";
}

function getScoreBarClass(score) {
  const value = getScoreValue(score);
  if (value === null) return "bg-stone-300";
  if (value >= 85) return "bg-teal-600";
  if (value >= 70) return "bg-emerald-600";
  if (value >= 40) return "bg-sky-600";
  return "bg-rose-500";
}

function scoreFromTen(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return Math.round(Math.max(0, Math.min(10, score)) * 10);
}

function getCoverageScore(evaluations) {
  if (!evaluations.length) return null;

  const total = evaluations.reduce((sum, evaluation) => {
    const parts = [
      evaluation.hasSituation,
      evaluation.hasAction,
      evaluation.hasResult,
    ];
    const covered = parts.filter(Boolean).length;
    return sum + (covered / parts.length) * 100;
  }, 0);

  return Math.round(total / evaluations.length);
}

function Feedback() {
  const { token } = useAuth();
  const location = useLocation();
  const selectedFromNavigation = location.state?.selectedInterview;

  const [selectedId, setSelectedId] = useState(() =>
    getInterviewId(selectedFromNavigation),
  );
  const [selectedInterview, setSelectedInterview] = useState(
    selectedFromNavigation || null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeedbackList() {
      if (!token) {
        setLoading(false);
        setError("Sign in to view your interview feedback.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllInterviews(token);
        if (!isMounted) return;

        const nextInterviews = normalizeInterviews(data);
        const completedInterviews = nextInterviews.filter(
          (interview) => interview.status !== "in_progress",
        );
        const nextSelectedId =
          getInterviewId(selectedFromNavigation) ||
          getInterviewId(completedInterviews[0]) ||
          getInterviewId(nextInterviews[0]);

        setSelectedId(nextSelectedId);

        const listMatch = nextInterviews.find(
          (interview) => getInterviewId(interview) === nextSelectedId,
        );
        setSelectedInterview(
          selectedFromNavigation || listMatch || nextInterviews[0] || null,
        );
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Could not load feedback.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeedbackList();

    return () => {
      isMounted = false;
    };
  }, [token, selectedFromNavigation]);

  useEffect(() => {
    let isMounted = true;

    async function loadSelectedInterview() {
      if (!token || !selectedId) return;

      try {
        setLoadingSelected(true);
        const interview = await getInterviewById(selectedId, token);
        if (isMounted) setSelectedInterview(interview);
      } catch (err) {
        if (isMounted) setError(err.message || "Could not load this feedback.");
      } finally {
        if (isMounted) setLoadingSelected(false);
      }
    }

    loadSelectedInterview();

    return () => {
      isMounted = false;
    };
  }, [selectedId, token]);

  if (loading) {
    return <LoadingState />;
  }

  if (error && !selectedInterview) {
    return <EmptyState title="Feedback unavailable" message={error} />;
  }

  if (!selectedInterview) {
    return (
      <EmptyState
        title="No feedback yet"
        message="Complete an interview and Mavis will place the generated feedback here."
      />
    );
  }

  return (
    <section className="min-h-full bg-stone-100 px-8 py-10 sm:px-12 lg:px-16">
      <div className="mx-auto max-w-8xl">
        {loadingSelected && (
          <div className="mb-4 flex items-center gap-2 text-sm text-stone-500">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={16}
              className="animate-spin"
            />
            Updating feedback
          </div>
        )}

        <FeedbackDocument interview={selectedInterview} />
      </div>
    </section>
  );
}

function FeedbackDocument({ interview }) {
  const feedback = getFeedback(interview);
  const evaluations = Array.isArray(interview?.answerEvaluations)
    ? interview.answerEvaluations
    : [];
  const scores = feedback?.dimensionScores || {};

  if (!interview) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-stone-900">
          Select feedback to view.
        </p>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:px-10">
      <header className="border-b border-stone-200 bg-stone-50 px-7 py-6 sm:px-9 mb-3">
        <p className="text-sm font-medium text-stone-500">
          Mavis feedback brief
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
          {getInterviewTitle(interview)}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <span>{formatDate(getInterviewDate(interview))}</span>
          <span>-</span>
          <span>
            {interview.durationSeconds
              ? `${Math.round(interview.durationSeconds / 60)} min session`
              : "Interview session"}
          </span>
          <span>-</span>
          <span className="capitalize">{interview.status || "completed"}</span>
        </div>
      </header>

      {!feedback ? (
        <div className="m-7 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:m-9">
          Feedback has not been generated for this interview yet. If this
          interview just ended, wait a moment and refresh once the agent has
          flushed the evaluations.
        </div>
      ) : (
        <div className="px-7 py-7 sm:px-9">
          <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <ScorePanel
              score={feedback.overallScore}
              evaluations={evaluations}
            />
            <MetricGrid scores={scores} evaluations={evaluations} />
          </section>

          <section className="mt-7 rounded-lg border border-stone-200 p-5">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
              <h2 className="text-lg font-semibold text-stone-950">
                Performance readout
              </h2>
              <p className="text-sm leading-6 text-stone-700">
                {feedback.summary || "No summary is available yet."}
              </p>
            </div>
          </section>

          <section className="mt-7 grid gap-4 lg:grid-cols-2">
            <FeedbackList
              title="Signals to keep"
              items={feedback.strengths}
              positive
            />
            <FeedbackList
              title="Next practice focus"
              items={feedback.weaknesses}
            />
          </section>
        </div>
      )}

      <section className="border-t border-stone-200 px-7 py-7 sm:px-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-950">
            Answer evidence
          </h2>
          <span className="text-xs text-stone-500">
            {evaluations.length} recorded
          </span>
        </div>

        {evaluations.length ? (
          <div className="space-y-3">
            {evaluations.map((evaluation, index) => (
              <EvaluationCard
                key={evaluation._id || `${evaluation.questionText}-${index}`}
                evaluation={evaluation}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 mb-4">
            No per-answer evaluations were saved for this session.
          </p>
        )}
      </section>
    </article>
  );
}

function ScorePanel({ score, evaluations }) {
  const value = getScoreValue(score);
  const percent = value === null ? 0 : Math.max(0, Math.min(100, value));
  const status = scoreToStatus(score);

  return (
    <div className="grid min-h-64 grid-cols-[64px_minmax(0,1fr)] gap-5 rounded-lg border border-stone-200 p-5 mb-3">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-full min-h-48 w-4 overflow-hidden rounded-full bg-stone-200">
          <div
            className={`absolute bottom-0 left-0 w-full rounded-full ${getScoreBarClass(score)}`}
            style={{ height: `${percent}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-stone-500">score</span>
      </div>

      <div className="flex flex-col justify-between ">
        <div>
          <p className="text-sm font-medium text-stone-500">
            Overall readiness
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-semibold text-stone-950">
              {value ?? "--"}
            </span>
            <span className="pb-1 text-base text-stone-500">/100</span>
          </div>
          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
          >
            {status}
          </span>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-4">
          <p className="text-sm text-stone-500">
            Built from {evaluations.length || "no"} saved answer evaluation
            {evaluations.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricGrid({ scores, evaluations }) {
  const metrics = [
    { label: "Structure and flow", score: scoreFromTen(scores.structure) },
    {
      label: "Specificity and detail",
      score: scoreFromTen(scores.specificity),
    },
    { label: "Role alignment", score: scoreFromTen(scores.relevance) },
    { label: "STAR coverage", score: getCoverageScore(evaluations) },
  ];

  return (
    <div className="grid content-start gap-3 sm:grid-cols-2">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          score={metric.score}
        />
      ))}
    </div>
  );
}

function MetricCard({ label, score }) {
  const value = getScoreValue(score);
  const status = scoreToStatus(score);
  const width = value === null ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-lg border border-stone-200 p-4 mb-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold leading-5 text-stone-950">
          {label}
        </h3>
        <div className="shrink-0 text-lg font-semibold text-stone-950">
          {value ?? "--"}
          <span className="text-sm font-normal text-stone-500">/100</span>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full ${getScoreBarClass(score)}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function FeedbackList({ title, items = [], positive = false }) {
  return (
    <div className="rounded-lg border border-stone-200 p-5 mb-3">
      <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-stone-700"
            >
              <span
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  positive
                    ? "bg-teal-100 text-teal-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                <HugeiconsIcon
                  icon={positive ? StarIcon : AlertCircleIcon}
                  size={13}
                />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-stone-500">Nothing recorded yet.</p>
      )}
    </div>
  );
}

function EvaluationCard({ evaluation }) {
  const scores = evaluation.dimensionScores || {};

  return (
    <div className="rounded-md border border-stone-200 bg-white p-4">
      <p className="text-sm font-medium text-stone-950">
        {evaluation.questionText || "Interview answer"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
        <Pill active={evaluation.hasSituation}>Situation</Pill>
        <Pill active={evaluation.hasAction}>Action</Pill>
        <Pill active={evaluation.hasResult}>Result</Pill>
        {evaluation.followUpNeeded && <Pill>Follow-up needed</Pill>}
      </div>
      <div className="mt-3 grid gap-2 text-xs text-stone-500 sm:grid-cols-3">
        <span>Structure: {scores.structure ?? "--"}/10</span>
        <span>Specificity: {scores.specificity ?? "--"}/10</span>
        <span>Relevance: {scores.relevance ?? "--"}/10</span>
      </div>
      {evaluation.notes && (
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {evaluation.notes}
        </p>
      )}
    </div>
  );
}

function Pill({ active = true, children }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 ${
        active
          ? "border-stone-300 bg-stone-100 text-stone-700"
          : "border-stone-200 bg-white text-stone-400"
      }`}
    >
      {children}
    </span>
  );
}

function LoadingState() {
  return (
    <section className="flex min-h-full items-center justify-center bg-stone-100 p-8">
      <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="animate-spin"
        />
        Loading feedback
      </div>
    </section>
  );
}

function EmptyState({ title, message }) {
  return (
    <section className="flex min-h-full items-center justify-center bg-stone-100 p-8">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-stone-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">{message}</p>
      </div>
    </section>
  );
}

export default Feedback;
