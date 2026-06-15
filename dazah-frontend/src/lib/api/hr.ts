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
  TrainingRecordListResponse,
  TrainingRecordResponse,
  TrainingAssessmentListResponse,
  TrainingAssessmentResponse,
  TrainingApprovalListResponse,
  TrainingApprovalResponse,
} from '@/types/hr'

const API_BASE = 'http://localhost:8004'

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

export async function fetchTrainingRecords(
  params?: {
    plan_id?: string
    employee_id?: string
    keyword?: string
    page?: number
    page_size?: number
  }
): Promise<TrainingRecordListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.plan_id) searchParams.set('plan_id', params.plan_id)
  if (params?.employee_id) searchParams.set('employee_id', params.employee_id)
  if (params?.keyword) searchParams.set('keyword', params.keyword)
  searchParams.set('page', String(params?.page || 1))
  searchParams.set('page_size', String(params?.page_size || 20))

  const res = await fetch(`${API_BASE}/api/v1/hr/training-records?${searchParams.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录列表失败')
  return res.json()
}

export async function fetchTrainingRecordById(id: string): Promise<TrainingRecordResponse> {
  const res = await fetch(`${API_BASE}/api/v1/hr/training-records/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('获取培训记录详情失败')
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
