import {
  MaterialBomListResponse,
  MaterialBomResponse,
  SyncStatusResponse,
} from '@/types/production'

const API_BASE = 'http://127.0.0.1:8000'

export async function fetchMaterialBoms(
  params?: {
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<MaterialBomListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const url = `${API_BASE}/api/v1/production/material-boms?${searchParams.toString()}`
  const res = await fetch(url, {
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[fetchMaterialBoms] failed:', res.status, url, text)
    throw new Error(`获取物料清单列表失败 (${res.status})`)
  }
  return res.json()
}

export async function fetchMaterialBomById(id: string): Promise<MaterialBomResponse> {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取物料清单详情失败')
  return res.json()
}

export async function fetchMaterialBomSyncStatus(): Promise<SyncStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms/sync-status`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取同步状态失败')
  return res.json()
}

export async function syncMaterialBomsFromFeishu(): Promise<{
  code: number
  message: string
  data: { created: number; updated: number; failed: number; total: number }
}> {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步失败')
  return res.json()
}

export async function syncMaterialBomToFeishu(id: string): Promise<{
  code: number
  message: string
  data: { feishu_record_id: string }
}> {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('同步到飞书失败')
  return res.json()
}
