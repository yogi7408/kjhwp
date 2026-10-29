
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function fetchDashboard({ startDate, endDate, cutoff }) {
  const query = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    cutoff_hour: String(cutoff),
  })

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard?${query}`
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      `${response.status}: ${
        details || 'Unable to load dashboard data'
      }`
    )
  }

  return response.json()
}
