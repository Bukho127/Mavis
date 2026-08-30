import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PdfIcon, Upload04Icon } from "@hugeicons/core-free-icons";
import FramedSection from "./FramedSection";

const steps = [
  {
    number: "01",
    title: "Paste your resume",
    description: "Drop in your resume or CV so Mavis knows your background.",
  },
  {
    number: "02",
    title: "Paste the job description",
    description: "Add the role you're applying for so questions stay relevant.",
  },
  {
    number: "03",
    title: "Start talking",
    description: "Mavis takes it from there, real questions, real time.",
  },
];

function HowItWorks() {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <FramedSection
      className="py-16 sm:py-20"
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      showTop={false}
    >
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16 sm: py-8">
        <div>
          <h2
            className="mb-8 font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-3xl font-semibold leading-[1.1] text-[#17211f] sm:text-4xl"
            id="how-it-works-title"
          >
            How to simulate an interview with Mavis
          </h2>

          <ol className="flex flex-col gap-6">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="text-sm font-semibold text-[#4A7FF8]">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-semibold text-[#17211f]">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{step.description}</p>
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

        <div
          ref={sectionRef}
          className="relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8"
        >
          <div className="relative mb-6 h-24 w-full max-w-[280px]">
            <div
              className={`absolute left-0 top-0 flex w-65 items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-md transition-all duration-700 ease-out ${
                isInView
                  ? "translate-x-6 translate-y-4 rotate-[-4deg] opacity-100"
                  : "-translate-y-10 rotate-0 opacity-0"
              }`}
            >
              <HugeiconsIcon icon={PdfIcon} size={22} className="shrink-0 text-red-500" />
              <span className="truncate text-xs font-medium text-gray-700">
                CV_final_JuniorDev.pdf
              </span>
            </div>

            <div
              className={`absolute left-8 top-6 flex w-65 items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-md transition-all duration-700 ease-out delay-150 ${
                isInView
                  ? "translate-x-2 translate-y-8 rotate-[3deg] opacity-100"
                  : "-translate-y-10 rotate-0 opacity-0"
              }`}
            >
              <HugeiconsIcon icon={PdfIcon} size={22} className="shrink-0 text-red-500" />
              <span className="truncate text-xs font-medium text-gray-700">
                My_cover_letter.pdf
              </span>
            </div>
          </div>

          <HugeiconsIcon icon={Upload04Icon} size={28} className="mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Click to upload</p>
          <p className="mt-1 text-xs text-gray-400">PDF, DOCX up to 5MB</p>
        </div>
      </div>
    </FramedSection>
  );
}

export default HowItWorks;