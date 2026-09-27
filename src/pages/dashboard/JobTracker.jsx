import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Calendar03Icon,
  Loading03Icon,
  PlusSignCircleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";
import { useJobApplications } from "../../hooks/useJobApplications";
import JobApplicationModal from "../../components/dashboard/job-tracker/JobApplicationModal";
import JobBoard from "../../components/dashboard/job-tracker/JobBoard";
import JobDetailPanel from "../../components/dashboard/job-tracker/JobDetailPanel";

function getUpcomingCount(applications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return applications.filter((application) => {
    if (!application.nextStepDate) return false;
    const date = new Date(`${application.nextStepDate}T00:00:00`);
    return date >= today && date <= nextWeek;
  }).length;
}

function getActiveCount(applications) {
  return applications.filter(
    (application) =>
      application.status !== "closed" && application.status !== "offer",
  ).length;
}

function filterApplications(applications, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return applications;

  return applications.filter((application) => {
    const searchable = [
      application.company,
      application.role,
      application.location,
      application.stage,
      application.notes,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

function StatCard({ icon, label, value, helper }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-600">
          <HugeiconsIcon icon={icon} size={19} />
        </span>
      </div>
      <p className="mt-2 text-xs text-stone-500">{helper}</p>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex min-h-[26rem] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
          <HugeiconsIcon icon={Briefcase01Icon} size={22} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-stone-950">
          Start your pipeline
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Save roles, track next steps, and keep interview prep tied to the job
          you actually want.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#4A7FF8] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f73e6]"
        >
          <HugeiconsIcon icon={PlusSignCircleIcon} size={16} />
          Add application
        </button>
      </div>
    </div>
  );
}

function JobTracker() {
  const { token } = useAuth();
  const {
    applications,
    loading,
    error,
    saveApplication,
    updateApplicationStatus,
    deleteApplication,
    reloadApplications,
  } = useJobApplications(token);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredApplications = useMemo(
    () => filterApplications(applications, query),
    [applications, query],
  );

  const selectedApplication = useMemo(
    () =>
      applications.find((application) => application.id === selectedId) ||
      filteredApplications[0] ||
      null,
    [applications, filteredApplications, selectedId],
  );

  const activeCount = useMemo(() => getActiveCount(applications), [applications]);
  const upcomingCount = useMemo(() => getUpcomingCount(applications), [applications]);
  const offerCount = applications.filter((application) => application.status === "offer").length;

  const handleAdd = () => {
    setEditingApplication(null);
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedApplication) return;
    setEditingApplication(selectedApplication);
    setModalOpen(true);
  };

  const handleSave = async (application) => {
    try {
      setSaving(true);
      const savedApplication = await saveApplication(application);
      setSelectedId(savedApplication.id);
      setModalOpen(false);
      setEditingApplication(null);
    } catch (err) {
      window.alert(err.message || "Unable to save this application.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;

    const confirmed = window.confirm("Delete this application?");
    if (!confirmed) return;

    try {
      await deleteApplication(selectedApplication.id);
      setSelectedId(null);
    } catch (err) {
      window.alert(err.message || "Unable to delete this application.");
    }
  };

  return (
    <section className="min-h-full bg-stone-100 px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-8xl flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-950">Job Tracker</h1>
            <p className="mt-1 text-sm text-stone-500">
              Manage your job search pipeline and prep from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#4A7FF8] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f73e6]"
          >
            <HugeiconsIcon icon={PlusSignCircleIcon} size={16} />
            Add application
          </button>
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {token && (
              <button
                type="button"
                onClick={reloadApplications}
                className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Briefcase01Icon}
            label="Active pipeline"
            value={activeCount.toLocaleString()}
            helper="Roles still in motion"
          />
          <StatCard
            icon={Calendar03Icon}
            label="Next 7 days"
            value={upcomingCount.toLocaleString()}
            helper="Follow-ups or interviews due"
          />
          <StatCard
            icon={Briefcase01Icon}
            label="Offers"
            value={offerCount.toLocaleString()}
            helper="Wins to review or negotiate"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3">
            <HugeiconsIcon icon={Search01Icon} size={17} className="text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, role, stage, notes"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
          </div>
          <p className="px-1 text-xs text-stone-500">
            {filteredApplications.length.toLocaleString()} shown
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[26rem] items-center justify-center rounded-lg border border-stone-200 bg-white text-sm text-stone-500 shadow-sm">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="mr-2 animate-spin"
            />
            Loading applications
          </div>
        ) : applications.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <JobBoard
              applications={filteredApplications}
              selectedId={selectedApplication?.id}
              onSelectApplication={setSelectedId}
              onStatusChange={updateApplicationStatus}
            />
            <JobDetailPanel
              application={selectedApplication}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      <JobApplicationModal
        open={modalOpen}
        application={editingApplication}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={handleSave}
      />
    </section>
  );
}

export default JobTracker;
