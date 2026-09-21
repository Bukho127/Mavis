import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Analytics01Icon,
  AnalyticsUpIcon,
  Briefcase01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { decodeUserIdFromToken, fetchAllInterviews, getQuota } from "../../api";
import { useAuth } from "../../context/AuthContext";
import OverviewStatCard from "../../components/dashboard/overview/OverviewStatCard";
import TokenUsageChart from "../../components/dashboard/overview/TokenUsageChart";
import RecentFeedbackTable from "../../components/dashboard/overview/RecentFeedbackTable";

function normalizeInterviews(data) {
  const interviews = Array.isArray(data)
    ? data
    : data?.interviews || data?.data || [];

  return [...interviews].sort((a, b) => {
    const aDate = new Date(a.endedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.endedAt || b.createdAt || 0).getTime();
    return bDate - aDate;
  });
}

function getAverageScore(interviews) {
  const scores = interviews
    .map((interview) => interview.feedback?.overallScore)
    .filter((score) => typeof score === "number" && !Number.isNaN(score));

  if (!scores.length) return null;

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

function getTokenChartData(interviews, quota) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      tokens: 0,
    };
  });

  interviews.forEach((interview) => {
    const tokens = interview.tokensUsed || 0;
    if (!tokens) return;

    const date = new Date(interview.endedAt || interview.updatedAt || interview.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const day = days.find((item) => item.date.toDateString() === date.toDateString());
    if (day) day.tokens += tokens;
  });

  const hasInterviewTokens = days.some((day) => day.tokens > 0);
  if (!hasInterviewTokens && quota?.tokenUsage) {
    days[days.length - 1].tokens = quota.tokenUsage;
  }

  return days;
}

function Overview() {
  const { token } = useAuth();
  const userId = token ? decodeUserIdFromToken(token) : null;
  const [interviews, setInterviews] = useState([]);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      if (!token || !userId) {
        setLoading(false);
        setError("Sign in to view your overview.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [interviewData, quotaData] = await Promise.all([
          fetchAllInterviews(token),
          getQuota(userId, token),
        ]);

        if (!isMounted) return;

        setInterviews(normalizeInterviews(interviewData));
        setQuota(quotaData);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Could not load overview.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [token, userId]);

  const completedInterviews = useMemo(
    () => interviews.filter((interview) => interview.status !== "in_progress"),
    [interviews],
  );
  const averageScore = useMemo(() => getAverageScore(completedInterviews), [completedInterviews]);
  const tokenChartData = useMemo(
    () => getTokenChartData(completedInterviews, quota),
    [completedInterviews, quota],
  );

  if (loading) {
    return (
      <section className="flex min-h-full items-center justify-center bg-stone-100 p-8">
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Loading overview
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-full bg-stone-100 p-8">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      </section>
    );
  }

  const percentUsed = Math.round(quota?.percentUsed || 0);
  const tokenUsage = quota?.tokenUsage || 0;
  const tokenLimit = quota?.tokenLimit || 100000;

  return (
    <section className="min-h-full bg-stone-100 px-8 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <OverviewStatCard
            icon={Briefcase01Icon}
            label="Interviews conducted"
            value={completedInterviews.length.toLocaleString()}
            helper={completedInterviews.length ? "Sessions completed" : "Start your first session"}
            tone="blue"
            action={
              percentUsed >= 100 ? (
                <span className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white">
                  Upgrade
                </span>
              ) : null
            }
          />
          <OverviewStatCard
            icon={Analytics01Icon}
            label="Average score"
            value={averageScore === null ? "--" : `${averageScore}%`}
            helper={averageScore === null ? "No scored feedback yet" : "Based on saved feedback"}
            tone="orange"
          />
          <OverviewStatCard
            icon={AnalyticsUpIcon}
            label="Token usage"
            value={`${percentUsed}%`}
            helper={`${tokenUsage.toLocaleString()} of ${tokenLimit.toLocaleString()} used`}
            tone={percentUsed >= 85 ? "orange" : "green"}
            action={
              <button
                type="button"
                className="rounded-md bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800"
              >
                Upgrade
              </button>
            }
          />
        </div>

        {percentUsed >= 100 ? (
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} />
            You have reached your monthly token limit.
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
            Your workspace is ready for more interviews.
          </div>
        )}

        <TokenUsageChart
          data={tokenChartData}
          totalTokens={tokenUsage}
          tokenLimit={tokenLimit}
        />

        <RecentFeedbackTable
          interviews={completedInterviews.slice(0, 5)}
          allInterviews={completedInterviews}
        />
      </div>
    </section>
  );
}

export default Overview;
