// Layout.jsx — Wraps every authenticated page with Sidebar + main content area

import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content — takes remaining space */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top padding on mobile to account for hamburger button */}
        <div className="lg:p-8 p-4 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}