import AttendanceImportClient from '@/components/hr/AttendanceImportClient'
import type { ImportBatch } from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export default async function AttendanceImportPage() {
  let batches: ImportBatch[] = []
  try {
    const res = await fetch(`${API_BASE}/api/v1/hr/attendance/batches?page=1&page_size=20`, { cache: 'no-store' })
    const json = await res.json()
    if (json.data) batches = json.data.items || []
  } catch {}

  return <AttendanceImportClient batches={batches} />
}
