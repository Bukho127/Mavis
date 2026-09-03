import Hero from "../components/landing/Hero";
import FramedSection from "../components/layout/FramedSection";
import WhatIsMavis from "../components/landing/WhatIsMavis";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import TransparentPricing from "../components/landing/TransparentPricing";
import PreFooterBanner from "../components/landing/PreFooterBanner";

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
      <TransparentPricing />
      <HowItWorks />
      <PreFooterBanner />
    </>
  );
}

export default Home;