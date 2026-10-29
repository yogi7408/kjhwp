export const formatNumber = (value, digits = 1) => {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return Number(value).toLocaleString('en-GB', { maximumFractionDigits: digits })
}

export const formatUkDateTime = (value, options = {}) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

export const makeChartPoints = (points = []) =>
  points.map((point) => ({
    ...point,
    label: formatUkDateTime(point.startTime),
  }))
