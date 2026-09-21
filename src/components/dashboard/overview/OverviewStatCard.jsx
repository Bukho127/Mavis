import { HugeiconsIcon } from "@hugeicons/react";

function OverviewStatCard({ icon, label, value, helper, tone = "blue", action }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tones[tone]}`}>
              <HugeiconsIcon icon={icon} size={17} />
            </span>
            <p className="text-sm font-medium text-stone-700">{label}</p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-stone-950">{value}</p>
        </div>

        {action}
      </div>

      <div className="my-3 h-px bg-stone-200" />

      {helper && <p className="text-xs text-stone-500">{helper}</p>}
    </article>
  );
}

export default OverviewStatCard;
