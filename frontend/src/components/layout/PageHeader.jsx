import { RefreshCw } from 'lucide-react'

export default function PageHeader({ onRefresh, busy }) {
  return <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
    <div><p className="text-xs font-bold tracking-[0.18em] text-violet-400">UK POWER MARKETS / WIND</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Wind forecast intelligence</h1><p className="mt-3 text-sm text-slate-400">Understand forecast availability and quantify generation uncertainty.</p></div>
    <div className="flex shrink-0 items-center gap-2"><span className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-300">January 2026 pilot</span><button onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Refresh</button></div>
  </header>
}
