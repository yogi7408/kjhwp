export default function AnalysisFilters({ startDate, endDate, cutoff, busy, onStartDateChange, onEndDateChange, onCutoffChange, onRun }) {
  const field = 'mt-2 w-full rounded-lg border border-slate-700 bg-[#0b1423] px-3 py-3 text-sm text-slate-100 outline-none focus:border-violet-400'
  const label = 'block text-[10px] font-bold tracking-wider text-slate-400'
  return <section className="mb-7 grid gap-5 rounded-2xl border border-slate-800 bg-[#111c2d] p-5 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_auto] xl:items-end">
    <div><h2 className="font-semibold">Analysis window</h2><p className="mt-2 max-w-xs text-sm text-slate-400">Select delivery dates and the day-ahead decision cutoff.</p></div>
    <label className={label}>START DATE<input className={field} type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)} /></label>
    <label className={label}>END DATE<input className={field} type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)} /></label>
    <label className={label}>CUTOFF (UK TIME)<select className={field} value={cutoff} onChange={e => onCutoffChange(e.target.value)}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></label>
    <button className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-50" onClick={onRun} disabled={busy}>{busy ? 'Loading…' : 'Run analysis'}</button>
  </section>
}
