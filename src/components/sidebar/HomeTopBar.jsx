import logo from '../../assets/logos/logo.svg'

function HomeTopBar() {
  return (
    <div className="flex h-12 w-full shrink-0 items-center border-b border-stone-200 bg-stone-50 px-4">
      <img
        src={logo}
        alt="Mavis logo"
        className="h-7 w-auto shrink-0"
      />
    </div>
  )
}

export default HomeTopBar
