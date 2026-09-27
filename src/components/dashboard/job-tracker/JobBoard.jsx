import JobCard from "./JobCard";
import { JOB_STATUSES } from "./jobTrackerConfig";

function JobBoard({
  applications,
  selectedId,
  onSelectApplication,
  onStatusChange,
}) {
  return (
    <div className="flex min-h-[32rem] gap-4 overflow-x-auto pb-2">
      {JOB_STATUSES.map((status) => {
        const columnApplications = applications.filter(
          (application) => application.status === status.id,
        );

        return (
          <section
            key={status.id}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-stone-200 bg-stone-50"
          >
            <div className="border-b border-stone-200 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                    <span className={`h-2.5 w-2.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">{status.helper}</p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-stone-500">
                  {columnApplications.length}
                </span>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
              {columnApplications.map((application) => (
                <JobCard
                  key={application.id}
                  application={application}
                  selected={application.id === selectedId}
                  onSelect={() => onSelectApplication(application.id)}
                  onStatusChange={onStatusChange}
                />
              ))}

              {columnApplications.length === 0 && (
                <div className="rounded-lg border border-dashed border-stone-200 bg-white p-4 text-center text-xs leading-5 text-stone-400">
                  No applications here yet.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default JobBoard;
