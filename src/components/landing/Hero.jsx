import backgroundImage from "../../assets/Background/background.png";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import AskMavis from "./AskMavis";

function Hero() {
  return (
    <section
      className="relative flex min-h-[min(760px,92svh)] items-center overflow-hidden bg-[#253b35] text-white"
      aria-labelledby="hero-title"
    >
      <img
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={backgroundImage}
        alt="image of a black woman practicing an interview in front of a laptop"
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(10,28,24,0.78),rgba(10,28,24,0.14))]" />
      <div className="relative z-[1] max-w-6xl px-5 pb-16 pt-28 sm:px-[10vw] sm:pb-[10vh] sm:pt-[20vh]">
        <h1
          className="max-w-[19ch] font-['Avantt_Trial','Trebuchet_MS',sans-serif] font-semibold text-3xl leading-[0.98] sm:text-[80px]"
          id="hero-title"
        >
          Practice interviews. Out loud. In real time.
        </h1>
        <p className="my-6 max-w-xl text-base sm:text-[1.05rem]">
          Meet Mavis — your AI interview coach who listens, responds, and
          adapts, just like a real interviewer would.
        </p>
        <a
          className="inline-flex rounded-md items-center bg-white px-5 py-3 font-semibold text-[#17211f] no-underline"
          href="#content"
        >
          Start mock interview
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={20}
            className="ml-2 inline-block"
          />
        </a>
      </div>
      <AskMavis />
    </section>
  );
}

export default Hero;
