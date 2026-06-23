import {
  EmployeeListResponse,
  EmployeeResponse,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  DepartmentListResponse,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  TeamListResponse,
  TeamCreateInput,
  TeamUpdateInput,
  OffboardingRecordListResponse,
  OffboardingRecordCreateInput,
  OffboardingRecordUpdateInput,
  OnboardingRecordListResponse,
  DepartureRecordListResponse,
  SyncStatusResponse,
  TrainingPlanListResponse,
  TrainingPlanResponse,
  TrainingPlanSopListResponse,
  TrainingPlanSopResponse,
  TrainingAssessmentListResponse,
  TrainingAssessmentResponse,
  TrainingApprovalListResponse,
  TrainingApprovalResponse,
  TrainingSessionListResponse,
  TrainingSessionResponse,
  TrainingSessionCreateInput,
  TrainingSessionUpdateInput,
  AnnualTrainingPlan,
  AnnualTrainingPlanItem,
  SelectTask,
} from '@/types/hr'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export async function fetchEmployees(
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

export async function fetchEmployeeById(id: string): Promise<EmployeeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取员工详情失败')
  return res.json()
}

export async function fetchEmployeeByNumber(employeeNumber: string): Promise<EmployeeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/by-number/${employeeNumber}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取员工详情失败')
  return res.json()
}

export async function fetchDepartments(
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

export async function fetchNewDepartments(
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

  const res = await fetch(`${API_BASE}/api/v1/hr/new/departments?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取新厂部门列表失败')
  return res.json()
}

export async function fetchTeams(
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

export async function fetchOffboardingRecords(
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

export async function fetchOnboardingRecords(
  params?: {
    employee_id?: string
    department?: string
    position?: string
    is_employed?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<OnboardingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.department) searchParams.set('department', params.department)
  if (params?.position) searchParams.set('position', params.position)
  if (params?.is_employed) searchParams.set('is_employed', params.is_employed)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取入职记录失败')
  return res.json()
}

export async function fetchDepartureRecords(
  params?: {
    department?: string
    offboarding_type?: string
    keyword?: string
    sort_by?: string
    sort_order?: string
    page?: number
    page_size?: number
  }
): Promise<DepartureRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.offboarding_type) searchParams.set('offboarding_type', params.offboarding_type)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  if (params?.sort_by) searchParams.set('sort_by', params.sort_by)
  if (params?.sort_order) searchParams.set('sort_order', params.sort_order)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取离职台账记录失败')
  return res.json()
}

// ─── Feishu Sync APIs ───

export async function fetchSyncStatus(): Promise<SyncStatusResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-status`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取同步状态失败')
  return res.json()
}

export async function syncFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步失败')
  return res.json()
}

export async function syncToFeishu(id: string): Promise<{ code: number; message: string; data: { feishu_record_id: string } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/employees/${id}/sync-to-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('同步到飞书失败')
  return res.json()
}

export async function fetchTrainingPlans(
  params?: {
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingPlanListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划列表失败')
  return res.json()
}

export async function fetchTrainingPlanById(id: string): Promise<TrainingPlanResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plans/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划详情失败')
  return res.json()
}

export async function fetchTrainingPlanSops(
  params?: {
    plan_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingPlanSopListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.plan_id) searchParams.set('plan_id', params.plan_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划SOP列表失败')
  return res.json()
}

export async function fetchTrainingPlanSopById(id: string): Promise<TrainingPlanSopResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-plan-sops/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训计划SOP详情失败')
  return res.json()
}

export async function fetchTrainingAssessments(
  params?: {
    record_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingAssessmentListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.record_id) searchParams.set('record_id', params.record_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训考核列表失败')
  return res.json()
}

export async function fetchTrainingAssessmentById(id: string): Promise<TrainingAssessmentResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-assessments/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训考核详情失败')
  return res.json()
}

export async function fetchTrainingApprovals(
  params?: {
    record_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingApprovalListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.record_id) searchParams.set('record_id', params.record_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  try {
    const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals?${searchParams.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('获取培训审批列表失败')
    return res.json()
  } catch {
    return {
      code: 500,
      message: '服务暂不可用',
      data: [],
      meta: { page: params?.page || 1, page_size: params?.page_size || 20, total: 0 },
    }
  }
}

export async function fetchTrainingApprovalById(id: string): Promise<TrainingApprovalResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-approvals/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训审批详情失败')
  return res.json()
}

export { fetchTrainingPlanSops as fetchTrainingSops }

export async function syncOnboardingFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-records/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步入职台账失败')
  return res.json()
}

export async function syncDepartureFromFeishu(): Promise<{ code: number; message: string; data: { created: number; updated: number; failed: number; total: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/departure-records/sync-from-feishu`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('从飞书同步离职台账失败')
  return res.json()
}

export async function fetchTurnoverAnalysis(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/turnover-analysis`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取人员流动分析失败')
  return res.json()
}

export async function fetchOnboardingTrainingRecord(
  employeeId: string,
  employeeName: string,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/hr/employees/${employeeId}/onboarding-training-record?factory=${factory}`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('生成培训记录失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = factory === 'new'
    ? `R-GN-2002 B 新员工入职培训记录_${employeeName}.docx`
    : `7.3新员工入职培训记录_${employeeName}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function fetchPrejobTrainingPlan(
  employeeId: string,
  employeeName: string,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/hr/employees/${employeeId}/prejob-training-plan?factory=${factory}`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('生成岗前培训计划失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = factory === 'old'
    ? `7.4岗前培训计划_${employeeName}.xlsx`
    : `R-GN-2002 C 岗前培训计划_${employeeName}.docx`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export interface TrainingSignInSheetData {
  training_date: string
  training_time_start?: string
  training_time_end?: string
  department: string
  training_subject?: string
  topic: string
  instructor?: string
  location?: string
  training_method?: string
  employee_names: string[]
  remarks?: string
}

export async function generateTrainingSignInSheet(
  data: TrainingSignInSheetData,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sign-in-sheet?factory=${factory}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('生成培训签到表失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const contentType = res.headers.get('content-type') || ''
  const isZip = contentType.includes('zip')
  if (factory === 'new') {
    a.download = isZip
      ? `R-GN-2002 K 培训签到表_${data.training_date}.zip`
      : `R-GN-2002 K 培训签到表_${data.training_date}.xls`
  } else {
    a.download = isZip
      ? `7.5培训签到表_${data.training_date}.zip`
      : `7.5培训签到表_${data.training_date}.xlsx`
  }
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export interface TrainingNotificationData {
  department: string
  training_date: string
  subject: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  content?: string
  trainee_names: string[]
  issuer_department?: string
  issue_date?: string
}

export async function generateTrainingNotification(
  data: TrainingNotificationData,
  factory: string = 'old'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-notification?factory=${factory}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('生成培训通知失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `培训通知_${data.department}_${data.training_date}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export interface TrainingNotifyData {
  employee_numbers: string[]
  department?: string
  subject: string
  training_date: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  content?: string
  training_method?: string
  issuer_department?: string
  issue_date?: string
  factory?: string
}

export async function sendTrainingNotification(data: TrainingNotifyData): Promise<{ code: number; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('发送培训通知失败')
  return res.json()
}

export interface TrainingSelectTaskData {
  department: string
  training_date: string
  subject: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  content?: string
  training_method?: string
  issuer_department?: string
  issue_date?: string
  factory?: string
}

export async function sendTrainingSelectTask(data: TrainingSelectTaskData): Promise<{ code: number; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-select-tasks/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('发送飞书选择任务失败')
  return res.json()
}

export async function fetchTrainingSelectTaskResult(token: string): Promise<{ code: number; message: string; data: any }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-select-tasks/${token}/result`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取选择结果失败')
  return res.json()
}

export async function fetchTrainingSelectTasks(): Promise<{ code: number; message: string; data: any[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-select-tasks`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取选择任务列表失败')
  return res.json()
}

export interface TrainingEvaluationData {
  subject: string
  training_date?: string
  training_time_start?: string
  training_time_end?: string
  duration_hours?: number
  training_method?: string
  is_exam?: boolean
  trainer_type?: string
  trainer?: string
  department_personnel?: string
  expected_count?: number
  actual_count?: number
  absent_count?: number
  textbook?: string
  makeup_training?: boolean
  assessment_method?: string
  pass_count?: number
  fail_count?: number
  absent_exam_count?: number
  absent_exam_handling?: string
  excellent_count?: number
  qualified_count?: number
  unqualified_count?: number
  evaluation_conclusion?: string
  organizer?: string
  organizer_date?: string
  remarks?: string
}

export async function generateTrainingEvaluation(
  data: TrainingEvaluationData,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-evaluation?factory=${factory}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('生成培训效果评估表失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = factory === 'new'
    ? `R-GN-2002 L 培训效果评估表_${data.training_date || 'nodate'}.docx`
    : `7.6培训效果评估表_${data.training_date || 'nodate'}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export interface OnboardingEvaluationData {
  employee_name: string
  employee_number?: string
  gender?: string
  department_position?: string
  hire_date?: string
  training_period?: string
  regularization_date?: string
  assessment_contents?: string[]
  comprehensive_comment?: string
  is_qualified?: boolean
  assigned_position?: string
  assessment_method?: string
  dept_manager_signature?: string
  signature_date?: string
  remarks?: string
  dept_manager_agree?: boolean
  hr_manager_agree?: boolean
  qa_manager_agree?: boolean
  dept_manager?: string
  hr_manager?: string
  qa_manager?: string
  approval_date?: string
}

export async function generateOnboardingEvaluation(
  data: OnboardingEvaluationData,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/hr/onboarding-evaluation?factory=${factory}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('生成员工上岗评估表失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = factory === 'new'
    ? `R-GN-2002 M 员工上岗评估表_${data.approval_date || 'nodate'}.docx`
    : `7.7员工上岗评估表_${data.approval_date || 'nodate'}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function fetchTrainingLedgers(
  params?: {
    employee_number?: string
    date_from?: string
    date_to?: string
    page?: number
    page_size?: number
  }
): Promise<{ code: number; message: string; data: any[]; meta?: any }> {
  const searchParams = new URLSearchParams()
  if (params?.employee_number) searchParams.set('employee_number', params.employee_number)
  if (params?.date_from) searchParams.set('date_from', params.date_from)
  if (params?.date_to) searchParams.set('date_to', params.date_to)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训台账失败')
  return res.json()
}

export async function createTrainingLedger(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('创建培训台账失败')
  return res.json()
}

export async function updateTrainingLedger(id: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('更新培训台账失败')
  return res.json()
}

export async function deleteTrainingLedger(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('删除培训台账失败')
  return res.json()
}

export async function fetchTrainingLedgerPages(): Promise<{ code: number; message: string; data: any[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers/pages`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训台账页面失败')
  return res.json()
}

export async function createTrainingLedgerPage(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('创建培训台账页面失败')
  return res.json()
}

export async function fetchNewEmployees(
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

  const res = await fetch(`${API_BASE}/api/v1/hr/new/employees?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取新厂员工列表失败')
  return res.json()
}

export async function fetchNewOnboardingRecords(
  params?: {
    employee_id?: string
    department?: string
    position?: string
    is_employed?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<OnboardingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.department) searchParams.set('department', params.department)
  if (params?.position) searchParams.set('position', params.position)
  if (params?.is_employed) searchParams.set('is_employed', params.is_employed)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/new/onboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取新厂入职记录失败')
  return res.json()
}

export async function fetchNewDepartureRecords(
  params?: {
    department?: string
    offboarding_type?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<DepartureRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.offboarding_type) searchParams.set('offboarding_type', params.offboarding_type)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/new/departure-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取新厂离职台账列表失败')
  return res.json()
}

export async function fetchNewOffboardingRecords(
  params?: {
    department?: string
    offboarding_type?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<DepartureRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.offboarding_type) searchParams.set('offboarding_type', params.offboarding_type)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/new/offboarding-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取新厂离职管理列表失败')
  return res.json()
}

export async function fetchAnnualTrainingPlanById(id: string): Promise<{ code: number; message: string; data: AnnualTrainingPlan }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取年度培训计划详情失败')
  return res.json()
}

export async function fetchAnnualTrainingPlans(
  params?: {
    year?: number
    department?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<{ code: number; message: string; data: AnnualTrainingPlan[]; meta?: any }> {
  const searchParams = new URLSearchParams()
  if (params?.year) searchParams.set('year', String(params.year))
  if (params?.department) searchParams.set('department', params.department)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取年度培训计划列表失败')
  return res.json()
}

export async function fetchPlanItems(id: string): Promise<{ code: number; message: string; data: AnnualTrainingPlanItem[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/annual-training-plans/${id}/items`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取年度计划明细失败')
  return res.json()
}

export async function fetchCandidates(
  params?: {
    keyword?: string
    recommendation_level?: string
    sync_status?: string
    page?: number
    page_size?: number
  }
): Promise<any> {
  const searchParams = new URLSearchParams()
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  if (params?.recommendation_level) searchParams.set('recommendation_level', params.recommendation_level)
  if (params?.sync_status) searchParams.set('sync_status', params.sync_status)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/candidates?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取候选人列表失败')
  return res.json()
}

export async function fetchCandidateById(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/candidates/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取候选人详情失败')
  return res.json()
}

export async function fetchTrainingSelectTask(id: string): Promise<{ code: number; message: string; data: any }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-select-tasks/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取选择任务失败')
  return res.json()
}

export async function submitTrainingSelectTask(
  id: string,
  employeeNumbers: string[],
  employeeNames: string[]
): Promise<{ code: number; message: string; data: any }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-select-tasks/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_numbers: employeeNumbers, employee_names: employeeNames }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('提交选择结果失败')
  return res.json()
}

export async function exportTrainingLedger(
  params: {
    employee_number?: string
    date_from?: string
    date_to?: string
    ledger_type?: string
    factory?: string
  }
): Promise<void> {
  const searchParams = new URLSearchParams()
  if (params?.employee_number) searchParams.set('employee_number', params.employee_number)
  if (params?.date_from) searchParams.set('date_from', params.date_from)
  if (params?.date_to) searchParams.set('date_to', params.date_to)
  if (params?.ledger_type) searchParams.set('ledger_type', params.ledger_type)
  if (params?.factory) searchParams.set('factory', params.factory)

  const res = await fetch(`${API_BASE}/api/v1/hr/training-ledgers/export?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('导出培训台账失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // 从 Content-Disposition 头获取文件名，或根据厂区推断扩展名
  const disposition = res.headers.get('content-disposition') || ''
  const filenameMatch = disposition.match(/filename\*?=(?:utf-8'')?(.+)/i)
  a.download = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `培训台账.${params.factory === 'new' ? 'docx' : 'xlsx'}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function fetchOnboardingEvaluationByEmployeeId(
  employeeId: string,
  employeeName: string,
  factory: 'old' | 'new' = 'old'
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/hr/employees/${employeeId}/onboarding-evaluation?factory=${factory}`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('生成员工上岗评估表失败')
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = factory === 'old'
    ? `7.12员工上岗评估表_${employeeName}.xlsx`
    : `R-GN-2002 E 员工上岗评估表_${employeeName}.docx`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// ─── TrainingSession APIs ───

export async function fetchTrainingSessions(
  params?: {
    department?: string
    keyword?: string
    date_from?: string
    date_to?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingSessionListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.department) searchParams.set('department', params.department)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
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

export async function fetchTrainingSessionById(id: string): Promise<TrainingSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录详情失败')
  return res.json()
}

export async function createTrainingSession(data: TrainingSessionCreateInput): Promise<TrainingSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('创建培训记录失败')
  return res.json()
}

export async function updateTrainingSession(id: string, data: TrainingSessionUpdateInput): Promise<TrainingSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('更新培训记录失败')
  return res.json()
}

export async function deleteTrainingSession(id: string): Promise<{ code: number; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('删除培训记录失败')
  return res.json()
}

export async function updateTrainingSessionStatus(id: string, status: string): Promise<TrainingSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('更新状态失败')
  return res.json()
}

export async function sendTrainingSessionSelectTasks(id: string): Promise<{ code: number; message: string; data: SelectTask[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/send-select-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('发送选择任务失败')
  return res.json()
}

export async function fetchTrainingSessionSelectTasks(id: string): Promise<{ code: number; message: string; data: SelectTask[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-sessions/${id}/select-tasks`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取选择任务失败')
  return res.json()
}

// ─── Training Specialists ───

export interface TrainingSpecialist {
  id: string
  department: string
  employee_number: string
  employee_name: string
  factory: string
}

export async function fetchTrainingSpecialists(): Promise<{ code: number; message: string; data: TrainingSpecialist[] }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-specialists`, { cache: 'no-store' })
  if (!res.ok) throw new Error('获取培训专员列表失败')
  return res.json()
}

export async function upsertTrainingSpecialist(data: { department: string; employee_number: string; employee_name: string; factory: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-specialists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('保存培训专员失败')
  return res.json()
}

export async function deleteTrainingSpecialist(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-specialists/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('删除培训专员失败')
  return res.json()
}


// ─── 考勤管理 Attendance API ───────────────────────────────────────

import {
  CalendarYear,
  CalendarMonth,
  AttendanceRecordListResponse,
  AttendanceRecordFilter,
  OvertimeListResponse,
  OvertimeFilter,
  OvertimeSummaryResponse,
  LeaveBalance,
  LeaveBalanceUpdateInput,
  ImportBatchListResponse,
  ImportBatch,
  ImportResult,
  AttendanceConfigListResponse,
  DepartmentProductionSettings,
} from '@/types/hr'

// ─── 日历 ───

export async function fetchInitCalendar(year: number) {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/init/${year}`, { method: 'POST' })
  return res.json()
}

export async function fetchCalendarYear(year: number): Promise<{ code: number; data: CalendarYear }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/${year}`)
  return res.json()
}

export async function fetchCalendarMonth(year: number, month: number): Promise<{ code: number; data: CalendarMonth }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/${year}/${month}`)
  return res.json()
}

// ─── 导入 ───

export async function uploadAttendanceFile(file: File): Promise<{ code: number; data: ImportResult }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/import`, {
    method: 'POST',
    body: formData,
  })
  return res.json()
}

export async function fetchImportBatches(page = 1, page_size = 20): Promise<{ code: number; data: ImportBatchListResponse }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/batches?page=${page}&page_size=${page_size}`)
  return res.json()
}

export async function fetchImportBatch(batchId: string): Promise<{ code: number; data: ImportBatch }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/batches/${batchId}`)
  return res.json()
}

// ─── 考勤记录 ───

export async function fetchAttendanceRecords(
  filter: AttendanceRecordFilter = {}
): Promise<{ code: number; data: AttendanceRecordListResponse }> {
  const params = new URLSearchParams()
  if (filter.date_from) params.set('date_from', filter.date_from)
  if (filter.date_to) params.set('date_to', filter.date_to)
  if (filter.employee_number) params.set('employee_number', filter.employee_number)
  if (filter.employee_name) params.set('employee_name', filter.employee_name)
  if (filter.department) params.set('department', filter.department)
  if (filter.is_abnormal !== undefined) params.set('is_abnormal', String(filter.is_abnormal))
  if (filter.import_batch) params.set('import_batch', filter.import_batch)
  params.set('page', String(filter.page || 1))
  params.set('page_size', String(filter.page_size || 20))
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/records?${params}`)
  return res.json()
}

// ─── 加班 ───

export async function fetchOvertimeRecords(
  filter: OvertimeFilter = {}
): Promise<{ code: number; data: OvertimeListResponse }> {
  const params = new URLSearchParams()
  if (filter.date_from) params.set('date_from', filter.date_from)
  if (filter.date_to) params.set('date_to', filter.date_to)
  if (filter.employee_number) params.set('employee_number', filter.employee_number)
  if (filter.employee_name) params.set('employee_name', filter.employee_name)
  if (filter.department) params.set('department', filter.department)
  if (filter.overtime_type) params.set('overtime_type', filter.overtime_type)
  if (filter.conversion_type) params.set('conversion_type', filter.conversion_type)
  if (filter.import_batch) params.set('import_batch', filter.import_batch)
  params.set('page', String(filter.page || 1))
  params.set('page_size', String(filter.page_size || 20))
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/overtime?${params}`)
  return res.json()
}

export async function fetchOvertimeSummary(
  year: number,
  month?: number,
  group_by: string = 'department'
): Promise<{ code: number; data: OvertimeSummaryResponse }> {
  const params = new URLSearchParams()
  params.set('year', String(year))
  params.set('group_by', group_by)
  if (month) params.set('month', String(month))
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/overtime/summary?${params}`)
  return res.json()
}

// ─── 假期余额 ───

export async function fetchLeaveBalances(
  employeeId: string,
  year?: number
): Promise<{ code: number; data: LeaveBalance[] }> {
  const params = year ? `?year=${year}` : ''
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/leave-balances/${employeeId}${params}`)
  return res.json()
}

export async function updateLeaveBalance(
  balanceId: string,
  input: LeaveBalanceUpdateInput
): Promise<{ code: number; data: LeaveBalance }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/leave-balances/${balanceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.json()
}

// ─── 配置 ───

export async function fetchAttendanceConfigs(): Promise<{ code: number; data: AttendanceConfigListResponse }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/config`)
  return res.json()
}

// ─── 职位级别 ───

export async function refreshPositionLevels(): Promise<{ code: number; data: { updated_count: number } }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/attendance/refresh-position-levels`, { method: 'POST' })
  return res.json()
}

// ─── 部门生产设置 ───

export async function setDepartmentProduction(
  departmentId: string,
  settings: DepartmentProductionSettings
): Promise<{ code: number; data: any }> {
  const res = await fetch(`${API_BASE}/api/v1/hr/departments/${departmentId}/production-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  return res.json()
}
