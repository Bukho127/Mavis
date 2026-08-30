import Hero from "../components/Hero";
import FramedSection from "../components/FramedSection";
import WhatIsMavis from "../components/WhatIsMavis";
import Features from "../components/Features";

function Home() {
  return (
    <>
      <Hero />
      <FramedSection
        className="min-h-[15rem] py-16 sm:py-10"
        id="content"
        aria-labelledby="content-title"
      >
        <WhatIsMavis />
      </FramedSection>
      <Features />
    </>
  );
}

export default Home;