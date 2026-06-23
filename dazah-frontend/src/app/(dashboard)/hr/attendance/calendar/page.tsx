import AttendanceCalendarClient from '@/components/hr/AttendanceCalendarClient'
import type { CalendarMonth } from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export default async function AttendanceCalendarPage() {
  const year = new Date().getFullYear()
  let months: CalendarMonth[] = []
  try {
    const res = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/${year}`, { cache: 'no-store' })
    const json = await res.json()
    if (json.data) months = json.data.months || []
  } catch {}

  return <AttendanceCalendarClient initialMonths={months} initialYear={year} />
}
