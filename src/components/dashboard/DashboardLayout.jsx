import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {ChevronDownIcon, ChevronUpIcon} from "@hugeicons/core-free-icons";
import Search from '../sidebar/Search'
import OverviewNavItem from '../sidebar/OverviewNavItem'
import InterviewNavItem from '../sidebar/InterviewNavItem'
import JobTrackerNavItem from '../sidebar/JobTrackerNavItem'
import MessagesNavItem from '../sidebar/MessagesNavItems'
import FeedbackNavItem from '../sidebar/FeedbackNavItem'
import AIPersonalitiesNavItem from '../sidebar/AIPersonalitiesNavItem'
import ExportsNavItem from '../sidebar/ExportsNavItem'
import PrivacyNavItem from '../sidebar/PrivacyNavItem'
import SettingsNavItem from '../sidebar/SettingsNavItem'
import BillingNavItem from '../sidebar/BillingNavItem'
import AppearanceNavItem from '../sidebar/Appeareance'
import SupportNavItem from '../sidebar/SupportNavItem'
import TokenContextCard from '../sidebar/TokenContextCard'
import HomeTopBar from '../sidebar/HomeTopBar'
import MainTopBar from '../../pages/dashboard/MainTopBar'


function SidebarGroup({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="border-t border-stone-200 pt-3">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between px-2 pb-2 text-xs  tracking-wide text-stone-500"
      >
        <span>{title}</span>
        <span aria-hidden="true" className="text-sm text-stone-500">
          {isOpen ? <HugeiconsIcon icon={ChevronUpIcon} size={12} /> : <HugeiconsIcon icon={ChevronDownIcon} size={12} />}
        </span>
      </button>
      {isOpen && <div className="flex flex-col gap-1">{children}</div>}
    </section>
  )
}

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="sticky top-0 flex h-screen w-70 shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-stone-50">
        <HomeTopBar />
        <div className="dashboard-sidebar min-h-0 flex-1 overflow-y-auto p-4">
          <Search />
          <nav className="flex flex-col gap-4" aria-label="Dashboard navigation">
            <SidebarGroup title="Essentials">
              <OverviewNavItem />
              <MessagesNavItem />
              <AIPersonalitiesNavItem />
            </SidebarGroup>

            <SidebarGroup title="Work">
              <JobTrackerNavItem />
              <InterviewNavItem />
              <FeedbackNavItem />
              <ExportsNavItem />
            </SidebarGroup>

            <SidebarGroup title="Account">
              <SettingsNavItem />
              <BillingNavItem />
              <PrivacyNavItem />
              <AppearanceNavItem />
              <SupportNavItem />
            </SidebarGroup>
          </nav>
          <div className="mt-4">
            <TokenContextCard />
          </div>
        </div>
      </aside>
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <MainTopBar />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
