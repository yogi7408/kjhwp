import { Activity, AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { formatNumber } from '../../utils/format'

function MetricCard({ label, value, unit, description, icon: Icon }) {
  return <article className="rounded-2xl border border-slate-800 bg-[#111c2d] p-5"><div className="flex items-center justify-between gap-3 text-xs text-slate-300">{label}<Icon className="text-violet-300" size={20} /></div><strong className="mt-6 block text-3xl font-semibold tracking-tight">{formatNumber(value)} {unit && <small className="text-sm font-normal text-slate-400">{unit}</small>}</strong><p className="mt-2 text-xs text-slate-400">{description}</p></article>
}
export default function PerformanceSnapshot({ data, onExport }) {
  const m = data?.metrics || {}
  return <><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-semibold">Performance snapshot</h2><p className="mt-1 text-sm text-slate-400">Metrics include only slots with an eligible forecast and an actual.</p></div><button onClick={onExport} disabled={!data?.points?.length} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-[#111c2d] px-4 py-3 text-xs hover:bg-slate-800 disabled:opacity-40"><Download size={15} /> Export CSV</button></div><section className="mb-7 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"><MetricCard label="Mean absolute error" value={m.mae} unit="MW" description="Average absolute forecast error" icon={Activity} /><MetricCard label="Root mean squared error" value={m.rmse} unit="MW" description="Penalises larger misses" icon={AlertTriangle} /><MetricCard label="Forecast bias" value={m.bias} unit="MW" description="Positive means over-forecasting" icon={Activity} /><MetricCard label="Matched slots" value={m.matched_slots} description={`${formatNumber(data?.actual_records, 0)} actuals · ${formatNumber(data?.forecast_records, 0)} forecasts`} icon={CheckCircle2} /></section></>
}
