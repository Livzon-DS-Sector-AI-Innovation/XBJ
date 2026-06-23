const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function fetchITTickets(params?: { keyword?: string; status?: string; ticket_type?: string; page?: number; page_size?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.ticket_type) searchParams.set('ticket_type', params.ticket_type)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))
  const res = await fetch(`${API_BASE}/api/v1/administration/it-service-tickets?${searchParams.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取IT工单列表失败')
  return res.json()
}

export async function createITTicket(data: any) {
  const res = await fetch(`${API_BASE}/api/v1/administration/it-service-tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('创建IT工单失败')
  return res.json()
}

export async function updateITTicket(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/v1/administration/it-service-tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('更新IT工单失败')
  return res.json()
}

export async function deleteITTicket(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/administration/it-service-tickets/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除IT工单失败')
  return res.json()
}
