import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download05Icon,
  Loading03Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { deleteInterview, fetchAllInterviews } from "../../api";
import { useAuth } from "../../context/AuthContext";

function getInterviewId(interview) {
  return interview?._id || interview?.id || interview?.interviewId;
}

function getInterviewRole(interview) {
  return (
    interview?.role ||
    interview?.jobTitle ||
    interview?.job_title ||
    interview?.title ||
    "Interview feedback"
  );
}

function getInterviewDate(interview) {
  return (
    interview?.date ||
    interview?.createdAt ||
    interview?.created_at ||
    interview?.endedAt ||
    interview?.updatedAt ||
    null
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.interviews)) return data.interviews;
  if (Array.isArray(data?.data)) return data.data;
  return [];
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
  return (
    interview?.feedback ||
    interview?.summary ||
    interview?.analysis ||
    interview?.report ||
    interview?.notes ||
    "No written feedback is available for this interview yet."
  );
}

function createDocumentHtml(interview) {
  if (!interview) return "";

  const role = escapeHtml(getInterviewRole(interview));
  const date = escapeHtml(formatDate(getInterviewDate(interview)));
  const standing = escapeHtml(interview.standing || interview.status || "Completed");
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

function Exports() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      if (!token) {
        setLoading(false);
        setError("Sign in to view your exported documents.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchAllInterviews(token);
        const normalizedDocuments = normalizeCollection(data).sort((a, b) => {
          const first = new Date(getInterviewDate(a) || 0).getTime();
          const second = new Date(getInterviewDate(b) || 0).getTime();
          return second - first;
        });

        if (!isMounted) return;

        setDocuments(normalizedDocuments);
        setSelectedId((currentId) => {
          if (
            currentId &&
            normalizedDocuments.some((item) => getInterviewId(item) === currentId)
          ) {
            return currentId;
          }

          return getInterviewId(normalizedDocuments[0]) || null;
        });
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load export documents.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const selectedDocument = useMemo(
    () => documents.find((document) => getInterviewId(document) === selectedId) || null,
    [documents, selectedId],
  );

  const recentDocuments = documents.slice(0, 5);
  const documentHtml = useMemo(
    () => createDocumentHtml(selectedDocument),
    [selectedDocument],
  );
  const hasDocument = Boolean(selectedDocument);


  // Print and download handlers
  const handlePrint = () => {
    if (!hasDocument) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(documentHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = () => {
    if (!selectedDocument) return;

    const role = getInterviewRole(selectedDocument)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const blob = new Blob([documentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${role || "interview-feedback"}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (interview) => {
    const interviewId = getInterviewId(interview);
    if (!interviewId || deletingId) return;

    setDeletingId(interviewId);

    try {
      await deleteInterview(interviewId, token);

      setDocuments((currentDocuments) => {
        const remainingDocuments = currentDocuments.filter(
          (item) => getInterviewId(item) !== interviewId,
        );

        if (selectedId === interviewId) {
          setSelectedId(getInterviewId(remainingDocuments[0]) || null);
        }

        return remainingDocuments;
      });
    } catch (err) {
      setError(err.message || "Unable to delete this document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="flex h-full min-h-0 bg-stone-100">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-950">
                {hasDocument ? `${getInterviewRole(selectedDocument)}.pdf` : "No document selected"}
              </p>
              <p className="text-xs text-stone-500">
                {hasDocument ? "Document loaded" : "No document available"}
              </p>
            </div>
          </div>
         <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasDocument}
            className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HugeiconsIcon icon={Download05Icon} size={16} />
            Download
          </button>
        {/* print button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={!hasDocument}
            className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HugeiconsIcon icon={PrinterIcon} size={16} />
            Print
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-stone-200 p-6">
          {loading && (
            <div className="flex h-full items-center justify-center text-sm text-stone-500">
              <HugeiconsIcon icon={Loading03Icon} size={18} className="mr-2 animate-spin" />
              Loading documents...
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-red-200 bg-white p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && !hasDocument && (
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-stone-950">No exported documents yet</p>
              <p className="mt-1 text-sm text-stone-500">
                Complete an interview to generate feedback that can be viewed and downloaded here.
              </p>
            </div>
          )}

          {!loading && !error && hasDocument && (
            <iframe
              title="PDF-style feedback preview"
              srcDoc={documentHtml}
              className="mx-auto h-full min-h-[840px] w-full max-w-5xl rounded-sm border border-stone-300 bg-white shadow-xl"
            />
          )}
        </div>
      </div>

      <aside className="hidden w-[22rem] shrink-0 border-l border-stone-200 bg-stone-50 p-4 lg:block">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-stone-950">Latest feedback</h2>
          <p className="mt-1 text-xs text-stone-500">Newest to oldest, showing five.</p>
        </div>

        <div className="flex flex-col gap-2">
          {recentDocuments.map((documentItem) => {
            const interviewId = getInterviewId(documentItem);
            const isSelected = interviewId === selectedId;

            return (
              <div
                key={interviewId || `${getInterviewRole(documentItem)}-${getInterviewDate(documentItem)}`}
                className={`rounded-lg border bg-white p-3 ${
                  isSelected ? "border-[#4A7FF8]" : "border-stone-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(interviewId)}
                  className="w-full text-left"
                >
                  <p className="truncate text-sm font-semibold text-stone-950">
                    {getInterviewRole(documentItem)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {formatDate(getInterviewDate(documentItem))}
                  </p>
                </button>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] text-green-900 uppercase tracking-wide">
                    {documentItem.standing || documentItem.status || "Completed"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(documentItem)}
                    disabled={deletingId === interviewId}
                    aria-label={`Delete ${getInterviewRole(documentItem)}`}
                    className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && recentDocuments.length === 0 && (
            <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
              No feedback documents found.
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

export default Exports;
