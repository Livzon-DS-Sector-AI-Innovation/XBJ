import OvertimeSummaryClient from '@/components/hr/OvertimeSummaryClient'
import type { OvertimeSummaryItem } from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export default async function AttendanceOvertimePage() {
  const year = new Date().getFullYear()
  let items: OvertimeSummaryItem[] = []
  try {
    const res = await fetch(`${API_BASE}/api/v1/hr/attendance/overtime/summary?year=${year}&group_by=department`, { cache: 'no-store' })
    const json = await res.json()
    if (json.data) items = json.data.items || []
  } catch {}

  return <OvertimeSummaryClient initialItems={items} initialYear={year} />
}
