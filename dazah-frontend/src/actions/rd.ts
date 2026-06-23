'use server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function fetchModuleInfoAction() {
  const res = await fetch(`${API_BASE}/api/v1/research/`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取模块信息失败')
  return res.json()
}
