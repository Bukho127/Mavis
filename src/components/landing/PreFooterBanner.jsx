import bannerBackground from '../../assets/Background/CTA_Banner.svg'
import FramedSection from '../layout/FramedSection'

const prefooterContent = {
  image: bannerBackground,
  heading: "Ready to take your interview skills to the next level?",
  subheading: "Start practicing with Mavis today and gain the confidence you need to ace your next interview.",
  buttonText: "Get Started",
  buttonTextTwo: "Sign Up Now",
  buttonLink: "/signup",
}

const PreFooterBanner = () => {
  return (
    <FramedSection
      className="py-16 sm:py-20"
      id="prefooter-banner"
      aria-labelledby="prefooter-banner-title"
      showTop={false}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={prefooterContent.image}
          alt="Mavis prefooter banner"
          className=" w-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="mb-4 max-w-3xl text-[40px] font-bold">
            {prefooterContent.heading}
          </h2>
          <p className="mb-6 max-w-2xl text-[18px]">
            {prefooterContent.subheading}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
           <a
            href={prefooterContent.buttonLink}
            className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          >
            {prefooterContent.buttonText}
          </a>
          <a
            href={prefooterContent.buttonLink}
            className="rounded bg-white  px-4 py-2 font-semibold text-[#4A7FF8] hover:bg-gray-200"
          >
            {prefooterContent.buttonTextTwo}
          </a>
        </div>
        </div>
      </div>
    </FramedSection>
  )
}

export default PreFooterBanner