import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

function DocumentList({ cvFile, coverLetterFile, onRemoveCv, onRemoveCoverLetter }) {
  if (!cvFile && !coverLetterFile) return null;

  return (
    <div className="flex flex-col gap-2">
      {cvFile && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <HugeiconsIcon icon={Pdf01Icon} size={20} className="shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">{cvFile.name}</p>
            <p className="text-xs text-gray-400">CV</p>
          </div>
          <button
            type="button"
            onClick={onRemoveCv}
            aria-label="Remove CV"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {coverLetterFile && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <HugeiconsIcon icon={Pdf01Icon} size={20} className="shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">{coverLetterFile.name}</p>
            <p className="text-xs text-gray-400">Cover letter</p>
          </div>
          <button
            type="button"
            onClick={onRemoveCoverLetter}
            aria-label="Remove cover letter"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentList;