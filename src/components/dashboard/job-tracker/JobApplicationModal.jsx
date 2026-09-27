import { useEffect, useState } from "react";
import { JOB_STATUSES } from "./jobTrackerConfig";

const EMPTY_FORM = {
  company: "",
  role: "",
  status: "saved",
  location: "",
  jobUrl: "",
  dateApplied: "",
  nextStepDate: "",
  stage: "",
  notes: "",
  jobDescription: "",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function inputClass(extra = "") {
  return `w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-[#4A7FF8] focus:ring-2 focus:ring-[#4A7FF8]/15 ${extra}`;
}

function JobApplicationModal({ application, open, saving = false, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(application || EMPTY_FORM);
  }, [application, open]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ ...application, ...form });
  };

  const canSave = form.company.trim() && form.role.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={application ? "Edit application" : "Add application"}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl"
      >
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-950">
            {application ? "Edit application" : "Add application"}
          </h2>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company">
              <input
                className={inputClass()}
                value={form.company}
                onChange={handleChange("company")}
                placeholder="Company name"
              />
            </Field>
            <Field label="Role">
              <input
                className={inputClass()}
                value={form.role}
                onChange={handleChange("role")}
                placeholder="Frontend Developer"
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass()}
                value={form.status}
                onChange={handleChange("status")}
              >
                {JOB_STATUSES.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stage">
              <input
                className={inputClass()}
                value={form.stage}
                onChange={handleChange("stage")}
                placeholder="Recruiter screen, technical, final"
              />
            </Field>
            <Field label="Date applied">
              <input
                type="date"
                className={inputClass()}
                value={form.dateApplied}
                onChange={handleChange("dateApplied")}
              />
            </Field>
            <Field label="Next step date">
              <input
                type="date"
                className={inputClass()}
                value={form.nextStepDate}
                onChange={handleChange("nextStepDate")}
              />
            </Field>
            <Field label="Location">
              <input
                className={inputClass()}
                value={form.location}
                onChange={handleChange("location")}
                placeholder="Remote, Cape Town, hybrid"
              />
            </Field>
            <Field label="Job link">
              <input
                type="url"
                className={inputClass()}
                value={form.jobUrl}
                onChange={handleChange("jobUrl")}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field label="Notes">
              <textarea
                className={inputClass("min-h-32 resize-y")}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Follow-up context, recruiter name, what to practice next"
              />
            </Field>
            <Field label="Job description">
              <textarea
                className={inputClass("min-h-32 resize-y")}
                value={form.jobDescription}
                onChange={handleChange("jobDescription")}
                placeholder="Paste the role details for future tailored prep"
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave || saving}
            className="rounded-md bg-[#4A7FF8] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f73e6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save application"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobApplicationModal;
