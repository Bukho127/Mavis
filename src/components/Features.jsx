import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowShrink02Icon,
  BrainIcon,
  ActivityIcon,
  SearchAreaIcon,
} from "@hugeicons/core-free-icons";
import FramedSection from "./FramedSection";

const features = [
  {
    icon: ArrowShrink02Icon,
    title: "Real-time voice, not text",
    description:
      "You answer out loud in the moment, the same pressure and pacing as the real interview, so the panic of thinking on your feet is already familiar by the time it counts.",
  },
  {
    icon: BrainIcon,
    title: "Adapts to the role you're applying for",
    description:
      "Paste in the job description and Mavis asks questions built around that actual role, not a generic script.",
  },
  {
    icon: ActivityIcon,
    title: "Remembers your progress across sessions",
    description:
      "Pick up where you left off and see how your answers improve over time, instead of starting from zero every time you practice.",
  },
  {
    icon: SearchAreaIcon,
    title: "Go deep, at scale",
    description:
      "Practice as many mock rounds as you need — Mavis adapts every time without losing context of where you left off.",
  },
];

function Features() {
  return (
    <FramedSection
      className="py-16 sm:py-15"
      id="features"
      aria-labelledby="features-title"
      showTop={false}
    >
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-16">
        <div>
          <p className="mb-4 text-md font-semibold uppercase tracking-[0.12em] text-[#4A7FF8]">
            Key Features
          </p>
          <h2
            className="font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-4xl font-semibold leading-[1.05] text-[#17211f] sm:text-5xl"
            id="features-title"
          >
            Interview prep that actually feels like the real thing
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 p-6"
            >
              <HugeiconsIcon
                icon={feature.icon}
                size={24}
                className="mb-4 text-[#4A7FF8]"
              />
              <h3 className="mb-2 font-semibold text-[#17211f]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </FramedSection>
  );
}

export default Features;