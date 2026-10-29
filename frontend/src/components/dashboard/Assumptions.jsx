const DEFAULT_NOTES = ['Uses Elexon national wind generation actuals and forecasts only.', 'Forecast selection cutoff defaults to 11:00 UK time on the day before delivery.']
export default function Assumptions({ notes }) {
  return <section className="rounded-2xl border border-slate-800 bg-[#111c2d] p-5"><b className="text-sm">Interpretation and assumptions</b><ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-400">{(notes?.length ? notes : DEFAULT_NOTES).map(note => <li key={note}>{note}</li>)}</ul></section>
}
