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
import { getInterviewStatusLabel, isCompletedInterview } from "../../lib/interviewStatus";
import {
  createFeedbackDocumentHtml,
  downloadFeedbackDocument,
  formatFeedbackDate,
  getInterviewDate,
  getInterviewId,
  getInterviewRole,
} from "../../lib/feedbackExport";

function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.interviews)) return data.interviews;
  if (Array.isArray(data?.data)) return data.data;
  return [];
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
        const normalizedDocuments = normalizeCollection(data)
          .filter(isCompletedInterview)
          .sort((a, b) => {
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
    () => createFeedbackDocumentHtml(selectedDocument),
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
    downloadFeedbackDocument(selectedDocument);
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
                    {formatFeedbackDate(getInterviewDate(documentItem))}
                  </p>
                </button>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] text-green-900 uppercase tracking-wide">
                    {documentItem.standing || getInterviewStatusLabel(documentItem)}
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
