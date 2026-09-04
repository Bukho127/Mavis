import { useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BellIcon,
  Briefcase01Icon,
  ChatFeedback01Icon,
  Download05Icon,
  FileSecurityIcon,
  GridViewIcon,
  HelpCircleIcon,
  Message01Icon,
  Mic01Icon,
  Settings01Icon,
  SparklesIcon,
  Sun01Icon,
  UserIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import InitialsGenerator from './InitialsGenerator'

const dashboardPages = [
  { path: '/dashboard', label: 'Overview', icon: GridViewIcon, end: true },
  { path: '/dashboard/interview', label: 'Interview', icon: Mic01Icon },
  { path: '/dashboard/jobs', label: 'Job Tracker', icon: Briefcase01Icon },
  { path: '/dashboard/messages', label: 'Messages', icon: Message01Icon },
  { path: '/dashboard/feedback', label: 'Feedback', icon: ChatFeedback01Icon },
  { path: '/dashboard/personalities', label: 'AI Personalities', icon: SparklesIcon },
  { path: '/dashboard/exports', label: 'Exports', icon: Download05Icon },
  { path: '/dashboard/privacy', label: 'Privacy', icon: FileSecurityIcon },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings01Icon },
  { path: '/dashboard/billing', label: 'Billing & Plan', icon: Wallet01Icon },
  { path: '/dashboard/appearance', label: 'Appearance', icon: Sun01Icon },
  { path: '/dashboard/support', label: 'Support', icon: HelpCircleIcon },
]

function getCurrentPage(pathname) {
  return (
    dashboardPages.find((page) =>
      page.end ? pathname === page.path : pathname.startsWith(page.path)
    ) || dashboardPages[0]
  )
}

function MainTopBar() {
  const location = useLocation()
  const currentPage = getCurrentPage(location.pathname)

  return (
    <header className="sticky top-0 z-10 flex h-12 w-full shrink-0 items-center justify-between border-b border-stone-200 px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-700">
          <HugeiconsIcon icon={currentPage.icon} size={18} />
        </span>
        <h1 className="truncate text-md font text-stone-900">
          {currentPage.label}
        </h1>
      </div>

      <div className="flex items-center gap-4 px-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center text-stone-600 cursor-pointer hover:text-stone-900"
        >
          <HugeiconsIcon icon={BellIcon} size={17} />
        </button>
         <span className="h-5 w-px bg-stone-400" aria-hidden="true" />
        <InitialsGenerator />
       
      </div>
    </header>
  )
}

export default MainTopBar
