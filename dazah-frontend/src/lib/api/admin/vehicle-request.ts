const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function fetchVehicleRequests(params?: { keyword?: string; status?: string; page?: number; page_size?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  if (params?.status) searchParams.set('status', params.status)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))
  const res = await fetch(`${API_BASE}/api/v1/administration/vehicle-requests?${searchParams.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取用车申请列表失败')
  return res.json()
}

export async function createVehicleRequest(data: any) {
  const res = await fetch(`${API_BASE}/api/v1/administration/vehicle-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('创建用车申请失败')
  return res.json()
}

export async function updateVehicleRequest(id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/v1/administration/vehicle-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('更新用车申请失败')
  return res.json()
}

export async function deleteVehicleRequest(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/administration/vehicle-requests/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除用车申请失败')
  return res.json()
}
