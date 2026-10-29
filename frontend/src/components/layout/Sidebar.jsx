
import { Activity, Wind } from 'lucide-react'

export default function Sidebar() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-800 bg-[#0d1728] p-5 lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white">
          <Wind size={25} />
        </span>

        <div>
          <b className="tracking-wide">WINDWISE</b>
          <p className="text-xs text-slate-400">
            Forecast intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Go to dashboard overview"
          className="flex w-full items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <Activity size={17} />
          <span>Overview</span>
        </button>
      </nav>

      
    
{/* Project Status Card */}
<div className="mt-8 hidden rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 lg:mt-auto lg:block">
  <div className="mb-4 flex items-center justify-between">
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      System status
    </span>

    <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      PILOT
    </span>
  </div>

  <div className="flex items-start gap-3">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-400">
      <Wind size={18} />
    </div>

    <div>
      <p className="text-sm font-medium text-slate-200">
        Elexon BMRS
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        National wind generation data
      </p>
    </div>
  </div>

  <div className="my-4 border-t border-slate-800" />

  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-400">Analysis period</span>
    <span className="font-medium text-slate-200">Jan 2026</span>
  </div>

  <p className="mt-3 text-[10px] leading-4 text-slate-500">
    Forecast intelligence for day-ahead power procurement.
  </p>
</div>

    </aside>
  )
}
