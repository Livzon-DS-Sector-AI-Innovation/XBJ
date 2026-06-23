import AttendanceRecordsClient from '@/components/hr/AttendanceRecordsClient'
import type { AttendanceRecord } from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export default async function AttendanceRecordsPage() {
  let records: AttendanceRecord[] = []
  let total = 0
  try {
    const res = await fetch(`${API_BASE}/api/v1/hr/attendance/records?page=1&page_size=20`, { cache: 'no-store' })
    const json = await res.json()
    if (json.data) {
      records = json.data.items || []
      total = json.data.total || 0
    }
  } catch {}

  return <AttendanceRecordsClient initialRecords={records} initialTotal={total} />
}
