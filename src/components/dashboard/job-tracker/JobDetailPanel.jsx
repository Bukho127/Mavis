import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  Delete02Icon,
  Edit02Icon,
  Mic01Icon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { formatJobDate, getJobStatus } from "./jobTrackerConfig";

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <p className="mt-1 text-sm text-stone-800">{value || "Not set"}</p>
    </div>
  );
}

function JobDetailPanel({ application, onEdit, onDelete }) {
  const navigate = useNavigate();

  if (!application) {
    return (
      <aside className="rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-stone-950">
          Select an application
        </p>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Open a card to see notes, dates, links, and role context.
        </p>
      </aside>
    );
  }

  const status = getJobStatus(application.status);

  return (
    <aside className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}>
              {status.label}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-stone-950">
              {application.role}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{application.company}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit application"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete application"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-rose-500 hover:bg-rose-50"
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Applied" value={formatJobDate(application.dateApplied)} />
          <DetailRow label="Next step" value={formatJobDate(application.nextStepDate)} />
          <DetailRow label="Stage" value={application.stage} />
          <DetailRow label="Location" value={application.location} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/interview", {
                state: {
                  jobTitle: application.role,
                  jobDescription: application.jobDescription,
                },
              })
            }
            className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            <HugeiconsIcon icon={Mic01Icon} size={16} />
            Practice
          </button>
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
              Open role
            </a>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
            <HugeiconsIcon icon={Note01Icon} size={16} />
            Notes
          </h3>
          <p className="mt-3 whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-600">
            {application.notes || "No notes saved yet."}
          </p>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
            <HugeiconsIcon icon={Calendar03Icon} size={16} />
            Role context
          </h3>
          <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-600">
            {application.jobDescription || "No job description saved yet."}
          </p>
        </section>
      </div>
    </aside>
  );
}

export default JobDetailPanel;
