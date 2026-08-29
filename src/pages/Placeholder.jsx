function Placeholder() {
  return (
    <section
      className="relative min-h-[28rem] bg-white px-5 pb-16 pt-48 sm:px-[10vw]"
      aria-labelledby="placeholder-title"
    >
      <div className="pointer-events-none absolute inset-y-0 left-5 w-px bg-gray-200 sm:left-[10vw]" />
      <div className="pointer-events-none absolute inset-y-0 right-5 w-px bg-gray-200 sm:right-[10vw]" />

      <p className="mb-4 text-md text-center font-semibold uppercase tracking-[0.12em] text-[#17211f]">
        Page placeholder
      </p>
      <h1
        className="max-w-[19ch] font-['Avantt_Trial','Trebuchet_MS',sans-serif] text-4xl leading-[0.98] text-[#17211f] sm:text-8xl"
        id="placeholder-title"
      >
        This page is ready for content. Add your components and content here to build out the page.
      </h1>
    </section>
  );
}

export default Placeholder;