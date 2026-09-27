import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  Briefcase01Icon,
} from "@hugeicons/core-free-icons";
import { formatJobDate, getJobStatus, JOB_STATUSES } from "./jobTrackerConfig";

function JobCard({ application, selected, onSelect, onStatusChange }) {
  const status = getJobStatus(application.status);

  return (
    <article
      className={`rounded-lg border bg-white p-3 shadow-sm transition hover:border-stone-300 ${
        selected ? "border-[#4A7FF8] ring-2 ring-[#4A7FF8]/10" : "border-stone-200"
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-950">
              {application.role}
            </p>
            <p className="mt-1 truncate text-xs text-stone-500">
              {application.company}
            </p>
          </div>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${status.dotClass}`} />
        </div>

        <div className="mt-3 space-y-2 text-xs text-stone-500">
          <p className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar03Icon} size={14} />
            <span className="truncate">
              Next: {formatJobDate(application.nextStepDate)}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <HugeiconsIcon icon={Briefcase01Icon} size={14} />
            <span className="truncate">{application.stage || "No stage set"}</span>
          </p>
        </div>
      </button>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={application.status}
          onChange={(event) => onStatusChange(application.id, event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs text-stone-700 outline-none focus:border-[#4A7FF8]"
          aria-label={`Status for ${application.role}`}
        >
          {JOB_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${application.role} job link`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900"
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
          </a>
        )}
      </div>
    </article>
  );
}

export default JobCard;
