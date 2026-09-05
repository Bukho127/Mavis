import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

function DocumentItem({ document, label, onRemove }) {
  const isUploading = document.status === "uploading";
  const hasError = document.status === "error";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Pdf01Icon} size={20} className="shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-700">{document.name}</p>
          <p className={hasError ? "text-xs text-red-500" : "text-xs text-gray-400"}>
            {hasError ? document.error : label}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </div>

      {isUploading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-[#4A7FF8] transition-all"
            style={{ width: `${document.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function DocumentList({ cvDocument, coverLetterDocument, onRemoveCv, onRemoveCoverLetter }) {
  if (!cvDocument && !coverLetterDocument) return null;

  return (
    <div className="flex flex-col gap-2">
      {cvDocument && (
        <DocumentItem document={cvDocument} label="CV" onRemove={onRemoveCv} />
      )}

      {coverLetterDocument && (
        <DocumentItem
          document={coverLetterDocument}
          label="Cover letter"
          onRemove={onRemoveCoverLetter}
        />
      )}
    </div>
  );
}

export default DocumentList;
