import { Link } from "react-router-dom";
import comingSoonImage from "../assets/empty-states/mavis_coming_soon.svg";

function ComingSoon({
  eyebrow = "Coming soon",
  title = "This workspace is on the way",
  description = "Mavis is getting this area ready so it feels useful, focused, and connected to the rest of your dashboard.",
  note = "We are polishing this workspace.",
  actionLabel = "Back to overview",
  actionTo = "/dashboard",
}) {
  return (
    <section className="flex min-h-full items-center justify-center bg-stone-100 px-6 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="grid items-center gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-[#4A7FF8]/25 bg-[#4A7FF8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#315ec5]">
              {eyebrow}
            </span>

            <h2 className="mt-5 text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
              {title}
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600 sm:text-base">
              {description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={actionTo}
                className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-semibold text-white hover:bg-stone-800"
              >
                {actionLabel}
              </Link>
              {note && <span className="text-sm text-stone-500">{note}</span>}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[22rem] rounded-lg bg-stone-50 p-5">
              <img
                src={comingSoonImage}
                alt="Mavis holding a coming soon flag"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ComingSoon;
