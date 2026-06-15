export interface MaterialBom {
  id: string
  name: string
  code?: string
  manufacturer?: string
  material_level?: string
  document_name?: string
  quality_standard?: string
  process_name?: string
  created_at?: string
  updated_at?: string
}

export interface MaterialBomListResponse {
  code: number
  message: string
  data: MaterialBom[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface MaterialBomResponse {
  code: number
  message: string
  data: MaterialBom
}

export interface SyncStatusResponse {
  code: number
  message: string
  data: {
    local_total: number
    feishu_total: number
    synced_count: number
    unsynced_count: number
    conflict_count: number
    last_sync_at: string | null
  }
}

export interface MaterialBomCreateInput {
  name: string
  code?: string
  manufacturer?: string
  material_level?: string
  document_name?: string
  quality_standard?: string
  process_name?: string
}

export interface MaterialBomUpdateInput {
  name?: string
  code?: string
  manufacturer?: string
  material_level?: string
  document_name?: string
  quality_standard?: string
  process_name?: string
}
