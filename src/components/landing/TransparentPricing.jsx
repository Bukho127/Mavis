import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  MoneyNotFound01Icon,
  CalendarRemove01Icon,
  CircleArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import FramedSection from "../layout/FramedSection";
import transparentPricingImage from "../../assets/Background/lady-smiling.png";

const points = [
  {
    icon: Clock01Icon,
    text: "Time-based plans, no unlimited gimmicks",
  },
  {
    icon: MoneyNotFound01Icon,
    text: "No setup or onboarding fees",
  },
  {
    icon: CalendarRemove01Icon,
    text: "Cancel anytime, no lock-in",
  },
];

function TransparentPricing() {
  return (
    <FramedSection
      className="py-16 sm:py-20"
      id="pricing"
      aria-labelledby="pricing-title"
      showTop={false}
      showBottom={false}
    >
      <div className="grid grid-cols-1 items-center gap-12 sm:grid-cols-2 sm:gap-16">
        <img
          src={transparentPricingImage}
          alt="Mavis pricing overview"
          className="w-full rounded-2xl object-cover"
        />

        <div>
          <p className="mb-4 inline-flex items-center gap-1 rounded-full border-[1px] border-[#E6E6E6] px-2 py-1.5 text-sm tracking-[0.12em] text-[#4A7FF8]">
            <HugeiconsIcon icon={CircleArrowRight02Icon} size={18} color="text-[#4A7FF8]" />
            Transparent Pricing
          </p>
          <h2
            className="mb-4 font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-3xl font-semibold leading-[1.1] text-[#1E055B] sm:text-4xl"
            id="pricing-title"
          >
            No hidden limits, just simple transparent pricing
          </h2>
          <p className="mb-8 text-gray-600">
            Pay for the practice time you'll actually use, with plans built
            around real interview prep, not a metered trial that runs out right
            when you need it most.
          </p>

          <ul className="flex flex-col gap-4">
            {points.map((point) => (
              <li key={point.text} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <HugeiconsIcon
                    icon={point.icon}
                    size={25}
                    className="text-[#4A7FF8]"
                  />
                </span>
                <span className="text-sm font-medium text-[#17211f]">
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <button>
            <a
              href="/pricing"
              className="mt-8 inline-flex items-center rounded-lg bg-[#4A7FF8] px-5 py-3 text-white no-underline"
            >
              Explore our plans
            </a>
          </button>
        </div>
      </div>
    </FramedSection>
  );
}

export default TransparentPricing;
