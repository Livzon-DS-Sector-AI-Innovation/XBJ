'use server'

import { revalidatePath } from 'next/cache'
import {
  MaterialBomCreateInput,
  MaterialBomUpdateInput,
} from '@/types/production'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export async function createMaterialBom(data: MaterialBomCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建物料失败')
  }
  revalidatePath('/production')
  return res.json()
}

export async function updateMaterialBom(id: string, data: MaterialBomUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/production/material-boms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新物料失败')
  }
  revalidatePath('/production')
  return res.json()
}
