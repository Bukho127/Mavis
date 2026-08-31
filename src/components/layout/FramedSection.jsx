function FramedSection({
  children,
  className = "",
  showTop = true,
  showBottom = true,
  ...props
}) {
  return (
    <section
      className={`relative bg-white px-5 sm:px-[10vw] ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gray-200 sm:left-[6vw]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gray-200 sm:right-[6vw]" />
      <div className="relative">
        {showTop && (
          <div className="pointer-events-none absolute w-[110%] right-[-5%] top-0 h-px bg-gray-200" />
        )}
        {children}
        {showBottom && (
          <div className="pointer-events-none absolute w-[110%] right-[-5%] bottom-0 h-px bg-gray-200" />
        )}
      </div>
    </section>
  );
}

export default FramedSection;