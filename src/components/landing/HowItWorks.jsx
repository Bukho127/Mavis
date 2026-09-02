import { HugeiconsIcon } from "@hugeicons/react";
import {
  ClipboardPasteIcon, 
  Briefcase01Icon, 
  Mic01Icon,
} from "@hugeicons/core-free-icons";
import FramedSection from "../layout/FramedSection";
import DragAndDropBurner from "../../assets/Background/drag_and_drop_burner.svg";

const steps = [
  {
    icon: ClipboardPasteIcon,
    title: "Paste your resume",
    description: "Drop in your resume or CV so Mavis knows your background.",
  },
  {
    icon: Briefcase01Icon,
    title: "Paste the job description",
    description: "Add the role you're applying for so questions stay relevant.",
  },
  {
    icon: Mic01Icon,
    title: "Start talking",
    description: "Mavis takes it from there, real questions, real time.",
  },
];

function HowItWorks() {
  return (
    <FramedSection
      className="py-16 sm:py-20"
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      showTop={false}
    >
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16 sm:py-8">
        <div>
          <h2
            className="mb-8 font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-3xl font-semibold leading-[1.1] text-[#1E055B] sm:text-4xl"
            id="how-it-works-title"
          >
            How to simulate an interview with Mavis
          </h2>

          <ol className="flex flex-col gap-6">
            {steps.map((step) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <HugeiconsIcon
                    icon={step.icon}
                    size={25}
                    className="text-[#4A7FF8]"
                  />
                </span>
                <div>
                  <h3 className="font-semibold text-[#17211f]">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href="/start-interview"
            className="mt-8 inline-flex items-center rounded-md bg-[#4A7FF8] px-5 py-3 font-semibold text-white no-underline"
          >
            Start Interview
          </a>
        </div>

        <div className="flex items-center justify-center">
          <img
            src={DragAndDropBurner}
            alt="Drag and drop your resume and job description"
            className="w-full max-w-md rounded-2xl"
          />
        </div>
      </div>
    </FramedSection>
  );
}

export default HowItWorks;
