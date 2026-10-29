import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import PageHeader from '../components/layout/PageHeader'
import AnalysisFilters from '../components/dashboard/AnalysisFilters'
import ErrorAlert from '../components/dashboard/ErrorAlert'
import PerformanceSnapshot from '../components/dashboard/PerformanceSnapshot'
import GenerationChart from '../components/dashboard/GenerationChart'
import DeliveryTable from '../components/dashboard/DeliveryTable'
import Assumptions from '../components/dashboard/Assumptions'
import { fetchDashboard } from '../services/dashboardApi'
import { makeChartPoints } from '../utils/format'

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-01-31')
  const [cutoff, setCutoff] = useState('11')
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setBusy(true); setError('')
    try { setData(await fetchDashboard({ startDate, endDate, cutoff })) }
    catch (err) { setError(err.message || 'Unable to load data') }
    finally { setBusy(false) }
  }, [startDate, endDate, cutoff])

  useEffect(() => { load() }, [load])
  const points = makeChartPoints(data?.points || [])



function exportCsv() {
  if (!data?.points?.length) return

  const columns = [
    'Delivery Date',
    'Delivery Time (UK)',
    'Forecast Published (UK)',
    'Forecast (MW)',
    'Actual (MW)',
    'Error (MW)',
    'Absolute Error (MW)',
    'Status',
  ]

  const formatUKDateTime = (value) => {
    if (!value) return { date: '', time: '' }

    const timestamp = new Date(value)

    if (Number.isNaN(timestamp.getTime())) {
      return { date: '', time: '' }
    }

    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(timestamp)

    const get = (type) =>
      parts.find((part) => part.type === type)?.value ?? ''

    return {
      date: `${get('day')}/${get('month')}/${get('year')}`,
      time: `${get('hour')}:${get('minute')}`,
    }
  }

  const escapeCsv = (value) => {
    const text = value == null ? '' : String(value)
    return `"${text.replace(/"/g, '""')}"`
  }

  const rows = data.points.map((p) => {
    const delivery = formatUKDateTime(p.startTime)
    const published = formatUKDateTime(p.publishTime)

    const status =
      p.forecast != null && p.actual != null
        ? 'Matched'
        : p.forecast == null
          ? 'No eligible forecast'
          : 'Awaiting actual'

    return [
      delivery.date,
      delivery.time,
      published.date
        ? `${published.date} ${published.time} UK`
        : '',
      p.forecast,
      p.actual,
      p.error,
      p.absoluteError,
      status,
    ]
  })

  const csv = [
    columns.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `wind-forecast-${startDate}-${endDate}.csv`

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}



  return <div className="min-h-screen bg-[#0b1220] text-slate-100 lg:flex">
    <Sidebar />
    <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader onRefresh={load} busy={busy} />
      <AnalysisFilters startDate={startDate} endDate={endDate} cutoff={cutoff} busy={busy} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onCutoffChange={setCutoff} onRun={load} />
      <ErrorAlert message={error} />
      <PerformanceSnapshot data={data} onExport={exportCsv} />
      <GenerationChart points={points} busy={busy} />
      <DeliveryTable points={points} />
      <Assumptions notes={data?.notes} />
      <footer className="py-8 text-center text-xs text-slate-500">WINDWISE · Pilot product concept · Elexon BMRS · Not a trading instruction</footer>
    </main>
  </div>
}
