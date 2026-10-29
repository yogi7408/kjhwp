import { AlertTriangle } from 'lucide-react'
export default function ErrorAlert({ message }) {
  if (!message) return null
  return <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-rose-900 bg-rose-950/50 p-4 text-rose-200"><AlertTriangle className="shrink-0" /><div><b>Data could not be loaded</b><p className="mt-1 text-sm">{message}</p><small className="mt-2 block text-rose-300/80">Check backend status and Elexon API availability.</small></div></div>
}
