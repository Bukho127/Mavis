import {
  getInterviewStatusLabel,
  isCompletedInterview,
} from "./interviewStatus";

export function getInterviewId(interview) {
  return interview?._id || interview?.id || interview?.interviewId;
}

export function getInterviewRole(interview) {
  return (
    interview?.role ||
    interview?.jobTitle ||
    interview?.job_title ||
    interview?.title ||
    "Interview feedback"
  );
}

export function getInterviewDate(interview) {
  return (
    interview?.date ||
    interview?.createdAt ||
    interview?.created_at ||
    interview?.endedAt ||
    interview?.updatedAt ||
    null
  );
}

export function formatFeedbackDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeTranscript(transcript) {
  if (!Array.isArray(transcript)) return [];

  return transcript
    .map((entry) => {
      if (typeof entry === "string") {
        return { speaker: "Transcript", text: entry };
      }

      return {
        speaker: entry.speaker || entry.role || "Speaker",
        text: entry.text || entry.content || entry.message || "",
      };
    })
    .filter((entry) => entry.text);
}

function getFeedbackText(interview) {
  if (!isCompletedInterview(interview)) {
    return "No evaluation is available because this interview was not completed.";
  }

  const feedback = interview?.feedback;
  if (feedback && typeof feedback === "object") {
    return feedback.summary || "No written feedback is available for this interview yet.";
  }

  return (
    feedback ||
    interview?.summary ||
    interview?.analysis ||
    interview?.report ||
    interview?.notes ||
    "No written feedback is available for this interview yet."
  );
}

export function createFeedbackDocumentHtml(interview) {
  if (!interview) return "";

  const role = escapeHtml(getInterviewRole(interview));
  const date = escapeHtml(formatFeedbackDate(getInterviewDate(interview)));
  const standing = escapeHtml(
    interview.standing || getInterviewStatusLabel(interview),
  );
  const feedback = escapeHtml(getFeedbackText(interview));
  const transcript = normalizeTranscript(interview.transcript);

  const transcriptMarkup = transcript.length
    ? transcript
        .map(
          (entry) => `
            <section class="turn">
              <strong>${escapeHtml(entry.speaker)}</strong>
              <p>${escapeHtml(entry.text)}</p>
            </section>
          `,
        )
        .join("")
    : `<p class="muted">No transcript is available for this export.</p>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${role} - Interview Feedback</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f5f5f4;
            color: #1c1917;
            font-family: Inter, Arial, sans-serif;
            line-height: 1.55;
          }
          .page {
            width: 794px;
            min-height: 1123px;
            margin: 24px auto;
            background: #fff;
            box-shadow: 0 18px 40px rgba(28, 25, 23, 0.14);
            padding: 64px;
          }
          .eyebrow {
            color: #78716c;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            margin: 8px 0 8px;
            font-size: 30px;
            line-height: 1.2;
          }
          .meta {
            display: flex;
            gap: 10px;
            margin-bottom: 34px;
            color: #57534e;
            font-size: 13px;
          }
          h2 {
            border-bottom: 1px solid #e7e5e4;
            margin: 28px 0 14px;
            padding-bottom: 8px;
            font-size: 16px;
          }
          p { margin: 0 0 12px; }
          .turn {
            border-left: 3px solid #4A7FF8;
            margin-bottom: 14px;
            padding-left: 12px;
          }
          .turn strong {
            display: block;
            margin-bottom: 4px;
            color: #292524;
            font-size: 13px;
            text-transform: capitalize;
          }
          .muted { color: #78716c; }
          @media print {
            body { background: #fff; }
            .page { box-shadow: none; margin: 0; width: auto; min-height: auto; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <p class="eyebrow">Mavis Interview Feedback</p>
          <h1>${role}</h1>
          <div class="meta">
            <span>${date}</span>
            <span>-</span>
            <span>${standing}</span>
          </div>

          <h2>Feedback</h2>
          <p>${feedback}</p>

          <h2>Transcript</h2>
          ${transcriptMarkup}
        </main>
      </body>
    </html>
  `;
}

export function downloadFeedbackDocument(interview) {
  if (!interview) return;

  const role = getInterviewRole(interview)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const blob = new Blob([createFeedbackDocumentHtml(interview)], {
    type: "text/html",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${role || "interview-feedback"}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
