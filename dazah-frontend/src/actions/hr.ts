'use server'

import { revalidatePath } from 'next/cache'
import {
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeListResponse,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  DepartmentListResponse,
  TeamCreateInput,
  TeamUpdateInput,
  TeamListResponse,
  OffboardingRecordCreateInput,
  OffboardingRecordUpdateInput,
  OffboardingRecordListResponse,
  TrainingSessionCreateInput,
  TrainingSessionUpdateInput,
  TrainingSessionListResponse,
  TrainingSessionResponse,
  SelectTask,
} from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export async function fetchEmployeesAction(
  params?: {
    department?: string
    status?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<EmployeeListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/employees?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取员工列表失败')
  return res.json()
}

export async function createEmployee(data: EmployeeCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function updateEmployee(id: string, data: EmployeeUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function deleteEmployee(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除员工失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

// ─── Feishu Sync Actions ───

export async function syncFromFeishuAction() {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '从飞书同步失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

export async function syncToFeishuAction(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '同步到飞书失败')
  }
  revalidatePath('/hr/profile')
  return res.json()
}

// ─── Department Actions ───

export async function fetchDepartmentsAction(
  params?: {
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<DepartmentListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 100))

  const res = await fetch(`${API_BASE}/api/v1/hr/departments?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取部门列表失败')
  return res.json()
}

export async function createDepartment(data: DepartmentCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function updateDepartment(id: string, data: DepartmentUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function deleteDepartment(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除部门失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

// ─── Team Actions ───

export async function fetchTeamsAction(
  params?: {
    department_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TeamListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department_id) searchParams.set('department_id', params.department_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 100))

  const res = await fetch(`${API_BASE}/api/v1/hr/teams?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取班组列表失败')
  return res.json()
}

export async function createTeam(data: TeamCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function updateTeam(id: string, data: TeamUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/teams/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除班组失败')
  }
  revalidatePath('/hr/departments')
  return res.json()
}

// ─── OffboardingRecord Actions ───

export async function fetchOffboardingRecordsAction(
  params?: {
    employee_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<OffboardingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职记录失败')
  return res.json()
}

export async function createOffboardingRecord(data: OffboardingRecordCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  revalidatePath('/hr/profile')
  return res.json()
}

export async function updateOffboardingRecord(id: string, data: OffboardingRecordUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  return res.json()
}

export async function deleteOffboardingRecord(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/offboarding-records/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除离职记录失败')
  }
  revalidatePath('/hr/offboarding')
  return res.json()
}

// ─── AnnualTrainingPlan Actions ───

import {
  AnnualTrainingPlanCreateInput,
  AnnualTrainingPlanListResponse,
  AnnualTrainingPlanUpdateInput,
  AnnualTrainingPlanItemBatchUpdateInput,
} from '@/types/hr'

export async function fetchAnnualTrainingPlansAction(
  params?: {
    year?: number
    department?: string
    page?: number
    page_size?: number
  }
): Promise<AnnualTrainingPlanListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.year) searchParams.set('year', String(params.year))
  if (params?.department) searchParams.set('department', params.department)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 100))

  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取年度培训计划列表失败')
  return res.json()
}

export async function createAnnualTrainingPlan(data: AnnualTrainingPlanCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建年度培训计划失败')
  }
  revalidatePath('/hr/training/annual-plan')
  return res.json()
}

export async function updateAnnualTrainingPlan(id: string, data: AnnualTrainingPlanUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新年度培训计划失败')
  }
  revalidatePath('/hr/training/annual-plan')
  return res.json()
}

export async function deleteAnnualTrainingPlan(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除年度培训计划失败')
  }
  revalidatePath('/hr/training/annual-plan')
  return res.json()
}

export async function batchUpdatePlanItems(id: string, data: AnnualTrainingPlanItemBatchUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans/${id}/items/batch`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新年度计划明细失败')
  }
  revalidatePath('/hr/training/annual-plan')
  return res.json()
}

// ─── TrainingSession Actions ───

export async function fetchTrainingSessionsAction(
  params?: {
    department?: string
    keyword?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingSessionListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.date_from) searchParams.set('date_from', params.date_from)
  if (params?.date_to) searchParams.set('date_to', params.date_to)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录列表失败')
  return res.json()
}

export async function createTrainingSession(data: TrainingSessionCreateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建培训记录失败')
  }
  revalidatePath('/hr/training/records')
  return res.json()
}

export async function updateTrainingSession(id: string, data: TrainingSessionUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新培训记录失败')
  }
  revalidatePath('/hr/training/records')
  return res.json()
}

export async function deleteTrainingSession(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除培训记录失败')
  }
  revalidatePath('/hr/training/records')
  return res.json()
}

export async function updateTrainingSessionStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新状态失败')
  }
  revalidatePath('/hr/training/records')
  return res.json()
}

// ─── TrainingSession Detail Actions ───

export async function fetchTrainingSessionByIdAction(id: string): Promise<TrainingSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录详情失败')
  return res.json()
}

export async function sendTrainingSessionSelectTasksAction(id: string): Promise<{ code: number; message: string; data: SelectTask[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/send-select-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '发送选择任务失败')
  }
  revalidatePath('/hr/training/records')
  return res.json()
}

export async function fetchTrainingSessionSelectTasksAction(id: string): Promise<{ code: number; message: string; data: SelectTask[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/select-tasks`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取选择任务状态失败')
  return res.json()
}

// ─── Candidate Actions ───

export async function parseResumePreviewAction(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/parse-resume`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '简历解析失败')
  }
  return res.json()
}

export async function createCandidateAction(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '创建候选人失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

export async function deleteCandidateAction(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '删除候选人失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

export async function syncCandidatesFromFeishuAction() {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '从飞书同步候选人失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

export async function syncCandidateToFeishuAction(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '同步候选人到飞书失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

export async function updateCandidateAction(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新候选人失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

export async function updateCandidateRecommendationLevelAction(id: string, level: string) {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/${id}/recommendation-level`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendation_level: level }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || '更新推荐等级失败')
  }
  revalidatePath('/hr/recruitment')
  return res.json()
}

// ─── 考勤管理 Attendance Actions ───────────────────────────────────

import {
  ImportResult,
  DepartmentProductionSettings,
  LeaveBalanceUpdateInput,
} from '@/types/hr'

/** 初始化年度日历 */
export async function initCalendarAction(year: number) {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/init/${year}`, { method: 'POST' })
  revalidatePath('/hr/attendance')
  return res.json()
}

/** 上传考勤Excel并导入 */
export async function uploadAttendanceAction(formData: FormData): Promise<ImportResult> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/import`, {
    method: 'POST',
    body: formData,
  })
  const json = await res.json()
  if (json.code === 0 || json.code === 200) {
    revalidatePath('/hr/attendance')
    return json.data
  }
  throw new Error(json.message || '导入失败')
}

/** 设置部门生产属性 */
export async function setDepartmentProductionAction(
  departmentId: string,
  settings: DepartmentProductionSettings
) {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${departmentId}/production-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  revalidatePath('/hr/departments')
  return res.json()
}

/** 更新假期余额 */
export async function updateLeaveBalanceAction(balanceId: string, input: LeaveBalanceUpdateInput) {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/leave-balances/${balanceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  revalidatePath('/hr/attendance')
  return res.json()
}

/** 刷新职位级别 */
export async function refreshPositionLevelsAction() {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/refresh-position-levels`, { method: 'POST' })
  revalidatePath('/hr/employees')
  return res.json()
}
