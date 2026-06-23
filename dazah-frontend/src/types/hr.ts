export interface Employee {
  id: string
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  age?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date: string
  graduation_date?: string
  work_years?: number
  factory_tenure?: string
  company_tenure?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status: string
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface EmployeeCreateInput {
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date: string
  graduation_date?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status?: string
}

export interface EmployeeUpdateInput {
  employee_number?: string
  name?: string
  domain_account?: string
  department?: string
  team?: string
  position?: string
  job_category?: string
  level?: string
  qualifications?: string[]
  qualification_type?: string
  gender?: string
  native_place?: string
  political_status?: string
  marital_status?: string
  household_type?: string
  status_category?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  work_start_date?: string
  factory_entry_date?: string
  livo_entry_date?: string
  hire_date?: string
  graduation_date?: string
  education?: string
  classification?: string
  school?: string
  major?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  status?: string
}

export interface EmployeeListResponse {
  code: number
  message: string
  data: Employee[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface EmployeeResponse {
  code: number
  message: string
  data: Employee
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

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface DepartmentCreateInput {
  name: string
  code: string
  description?: string
}

export interface DepartmentUpdateInput {
  name?: string
  code?: string
  description?: string
}

export interface DepartmentListResponse {
  code: number
  message: string
  data: Department[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface Team {
  id: string
  name: string
  code?: string
  description?: string
  department_id: string
  department?: Department
  created_at?: string
  updated_at?: string
}

export interface TeamCreateInput {
  name: string
  code?: string
  description?: string
  department_id: string
}

export interface TeamUpdateInput {
  name?: string
  code?: string
  description?: string
  department_id?: string
}

export interface TeamListResponse {
  code: number
  message: string
  data: Team[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OffboardingRecord {
  id: string
  employee_id: string
  employee?: Employee
  offboarding_date: string
  offboarding_type: string
  reason?: string
  handover_status: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface OffboardingRecordCreateInput {
  employee_id: string
  offboarding_date: string
  offboarding_type?: string
  reason?: string
  handover_status?: string
  notes?: string
}

export interface OffboardingRecordUpdateInput {
  employee_id?: string
  offboarding_date?: string
  offboarding_type?: string
  reason?: string
  handover_status?: string
  notes?: string
}

export interface OffboardingRecordListResponse {
  code: number
  message: string
  data: OffboardingRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OnboardingRecord {
  id: string
  seq_number?: number
  employee_number: string
  name: string
  domain_account?: string
  department: string
  team?: string
  position: string
  job_category?: string
  status_category?: string
  is_employed?: string
  hire_date: string
  factory_entry_date?: string
  livo_entry_date?: string
  work_start_date?: string
  graduation_date?: string
  birth_month?: number
  birth_day?: number
  contract_type?: string
  contract_start_date?: string
  contract_end_date?: string
  contract_start_2?: string
  contract_end_2?: string
  contract_start_3?: string
  contract_end_3?: string
  contract_start_4?: string
  contract_end_4?: string
  age?: number
  work_years?: number
  factory_tenure?: string
  company_tenure?: string
  hire_month?: string
  school?: string
  education?: string
  major?: string
  classification?: string
  id_card?: string
  id_card_expiry?: string
  id_card_address?: string
  current_address?: string
  marital_status?: string
  household_type?: string
  political_status?: string
  phone?: string
  email?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  bank_account_location?: string
  training_id?: string
  transfer_history?: string
  remarks?: string[]
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface OnboardingRecordListResponse {
  code: number
  message: string
  data: OnboardingRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface OnboardingRecordResponse {
  code: number
  message: string
  data: OnboardingRecord
}

export interface DepartureRecord {
  id: string
  name: string
  department: string
  team?: string
  position: string
  job_category?: string
  gender?: string
  status_category?: string
  livo_entry_date?: string
  factory_entry_date?: string
  work_start_date?: string
  offboarding_date: string
  company_tenure_at_leave?: string
  education?: string
  school?: string
  major?: string
  classification?: string
  id_card?: string
  native_place?: string
  household_type?: string
  marital_status?: string
  political_status?: string
  phone?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  bank_account?: string
  contract_type?: string
  transfer_history?: string
  offboarding_type: string
  offboarding_reason?: string[]
  offboarding_reason_2?: string[]
  offboarding_remarks?: string[]
  remarks?: string[]
  feishu_record_id?: string
  feishu_synced_at?: string
  created_at?: string
  updated_at?: string
}

export interface DepartureRecordListResponse {
  code: number
  message: string
  data: DepartureRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface DepartureRecordResponse {
  code: number
  message: string
  data: DepartureRecord
}

export interface AiSuggestion {
  suggestion: string
  evidence: string
}

export interface TurnoverRawData {
  period_start: string
  period_end: string
  onboarding_count: number
  onboarding_by_department: Record<string, number>
  onboarding_by_job_category: Record<string, number>
  onboarding_by_education: Record<string, number>
  departure_count: number
  departure_by_reason: Record<string, number>
  departure_by_department: Record<string, number>
  departure_by_job_category: Record<string, number>
  current_headcount: number
}

export interface TurnoverMetrics {
  net_change: number
  initial_headcount: number
  turnover_rate: number
}

export interface TurnoverAnalysisResponse {
  code: number
  message: string
  data: {
    raw_data: TurnoverRawData
    metrics: TurnoverMetrics
    ai_summary: string
    ai_suggestions: AiSuggestion[]
  }
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
  remarks?: string
  issuer_department?: string
  issue_date?: string
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

export interface TrainingLedgerRecord {
  id: string
  employee_number: string
  training_date: string
  training_subject: string
  training_method?: string
  duration_hours?: number
  location?: string
  trainer?: string
  assessment_result?: string
  source_type: string
  source_id?: string
  ledger_type?: string
  remarks?: string
  created_at?: string
  updated_at?: string
}

export interface TrainingLedgerCreateInput {
  employee_number: string
  training_date: string
  training_subject: string
  training_method?: string
  duration_hours?: number
  location?: string
  trainer?: string
  assessment_result?: string
  source_type?: string
  source_id?: string
  remarks?: string
  ledger_type?: string
}

export interface TrainingLedgerUpdateInput {
  employee_number?: string
  training_date?: string
  training_subject?: string
  training_method?: string
  duration_hours?: number
  location?: string
  trainer?: string
  assessment_result?: string
  source_type?: string
  source_id?: string
  remarks?: string
}

export interface TrainingLedgerListResponse {
  code: number
  message: string
  data: TrainingLedgerRecord[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

// ─── AI 出题相关类型 ───

export interface ChoiceOption {
  label: string
  text: string
}

export interface ChoiceQuestion {
  number: number
  question: string
  options: ChoiceOption[]
  answer?: string
}

export interface TrueFalseQuestion {
  number: number
  question: string
  answer?: string
}

export interface ExamGenerateResponse {
  code: number
  message: string
  data: {
    choice_questions: ChoiceQuestion[]
    true_false_questions: TrueFalseQuestion[]
  }
}

export interface ExamExportData {
  title: string
  examiner: string
  exam_date: string
  assessment_date: string
  choice_questions: ChoiceQuestion[]
  true_false_questions: TrueFalseQuestion[]
}

// ─── AnnualTrainingPlan Types ───

export interface AnnualTrainingPlan {
  id: string
  year: number
  department: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface AnnualTrainingPlanCreateInput {
  year: number
  department: string
  status?: string
}

export interface AnnualTrainingPlanUpdateInput {
  year?: number
  department?: string
  status?: string
}

export interface AnnualTrainingPlanListResponse {
  code: number
  message: string
  data: AnnualTrainingPlan[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface AnnualTrainingPlanItem {
  id: string
  plan_id: string
  month?: string
  trainee_count?: number
  duration_hours?: number
  content_and_textbook?: string
  target_audience?: string
  position_and_count?: string
  training_method?: string
  training_hours?: number
  confirmer?: string
  confirm_date?: string
  remarks?: string
  tracking_status?: string
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface AnnualTrainingPlanItemBatchUpdateInput {
  items: Omit<AnnualTrainingPlanItem, 'id' | 'plan_id' | 'created_at' | 'updated_at'>[]
}

export interface TrainingSession {
  id: string
  factory: string
  department: string
  training_date: string
  subject: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  training_method?: string
  content?: string
  trainee_departments?: string[]
  employee_names?: string[]
  employee_numbers?: string[]
  issuer_department?: string
  issue_date?: string
  remarks?: string
  status?: string
  select_task_token?: string
  select_tasks?: SelectTask[]
  created_at?: string
  updated_at?: string
}

export interface TrainingSessionCreateInput {
  factory: string
  department: string
  training_date: string
  subject: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  training_method?: string
  content?: string
  trainee_departments?: string[]
  employee_names?: string[]
  employee_numbers?: string[]
  issuer_department?: string
  issue_date?: string
  remarks?: string
  status?: string
}

export interface TrainingSessionUpdateInput {
  factory?: string
  department?: string
  training_date?: string
  subject?: string
  training_time_start?: string
  training_time_end?: string
  location?: string
  trainer?: string
  training_method?: string
  content?: string
  trainee_departments?: string[]
  employee_names?: string[]
  employee_numbers?: string[]
  issuer_department?: string
  issue_date?: string
  remarks?: string
  status?: string
}

export interface TrainingSessionListResponse {
  code: number
  message: string
  data: TrainingSession[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface TrainingSessionResponse {
  code: number
  message: string
  data: TrainingSession
}

export interface Candidate {
  id: string
  name: string
  position: string
  gender?: string
  school?: string
  education?: string
  major?: string
  recommendation_level?: string
  match_report?: string
  feishu_sync_status?: string
  feishu_sync_error?: string
  created_at?: string
  updated_at?: string
}

export interface CandidateListResponse {
  code: number
  message: string
  data: Candidate[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export interface SelectTask {
  department: string
  token: string
  status: 'pending' | 'submitted'
  employee_names?: string[]
  employee_numbers?: string[]
  specialist_name?: string
  specialist_found?: boolean
}

export interface SelectTaskListResponse {
  code: number
  message: string
  data: SelectTask[]
}

export interface TrainingPlanListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanResponse {
  code: number
  message: string
  data: any
}

export interface TrainingPlanSopListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanSopResponse {
  code: number
  message: string
  data: any
}

export interface TrainingAssessmentListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingAssessmentResponse {
  code: number
  message: string
  data: any
}

export interface TrainingApprovalListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingApprovalResponse {
  code: number
  message: string
  data: any
}

export interface TrainingRecordListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingRecordResponse {
  code: number
  message: string
  data: any
}

export interface TrainingPlanListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanResponse {
  code: number
  message: string
  data: any
}

export interface TrainingPlanSopListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanSopResponse {
  code: number
  message: string
  data: any
}

export interface TrainingAssessmentListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingAssessmentResponse {
  code: number
  message: string
  data: any
}

export interface TrainingApprovalListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingApprovalResponse {
  code: number
  message: string
  data: any
}

export interface TrainingRecordListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingRecordResponse {
  code: number
  message: string
  data: any
}

export interface TrainingPlanListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanResponse {
  code: number
  message: string
  data: any
}

export interface TrainingPlanSopListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingPlanSopResponse {
  code: number
  message: string
  data: any
}

export interface TrainingAssessmentListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingAssessmentResponse {
  code: number
  message: string
  data: any
}

export interface TrainingApprovalListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingApprovalResponse {
  code: number
  message: string
  data: any
}

export interface TrainingRecordListResponse {
  code: number
  message: string
  data: any[]
  meta?: any
}

export interface TrainingRecordResponse {
  code: number
  message: string
  data: any
}

// ─── 考勤管理 Attendance Types ─────────────────────────────────────

export interface CalendarDay {
  id: string
  date: string
  year: number
  month: number
  day: number
  day_of_week: number
  day_type: 'workday' | 'weekend' | 'holiday'
  holiday_name?: string
  is_workday: boolean
}

export interface CalendarMonth {
  year: number
  month: number
  workdays: number
  holidays: number
  rest_days: number
  days: CalendarDay[]
}

export interface CalendarYear {
  year: number
  total_workdays: number
  months: CalendarMonth[]
}

export interface AttendanceRecord {
  id: string
  record_date: string
  employee_id?: string
  employee_number: string
  employee_name?: string
  department_name?: string
  shift?: string
  is_abnormal: boolean
  actual_minutes?: number
  clock_in?: string
  clock_out?: string
  absent_minutes?: number
  absent_days?: number
  late_minutes?: number
  late_count?: number
  early_minutes?: number
  early_count?: number
  annual_leave_days?: number
  personal_leave?: number
  comp_leave?: number
  sick_leave_days?: number
  marriage_leave_days?: number
  maternity_leave_days?: number
  funeral_leave_days?: number
  injury_leave_days?: number
  business_trip?: number
  nursing_leave_days?: number
  training_days?: number
  area?: string
  shutdown_comp_leave?: number
  source_file?: string
  import_batch?: string
  created_at?: string
}

export interface AttendanceRecordListResponse {
  items: AttendanceRecord[]
  total: number
  page: number
  page_size: number
}

export interface OvertimeRecord {
  id: string
  employee_id?: string
  employee_number?: string
  employee_name?: string
  department_name?: string
  attendance_record_id?: string
  record_date: string
  overtime_type: 'weekday' | 'weekend' | 'holiday'
  overtime_hours: number
  conversion_type: 'comp_leave' | 'overtime_pay'
  comp_leave_hours: number
  overtime_pay: number
  overtime_rate: number
  calculated_at?: string
  import_batch?: string
  created_at?: string
}

export interface OvertimeListResponse {
  items: OvertimeRecord[]
  total: number
  page: number
  page_size: number
}

export interface OvertimeSummaryItem {
  department?: string
  employee_number?: string
  employee_name?: string
  month?: number
  weekday_ot_hours: number
  weekend_ot_hours: number
  holiday_ot_hours: number
  total_ot_hours: number
  comp_leave_hours: number
  overtime_pay: number
}

export interface OvertimeSummaryResponse {
  items: OvertimeSummaryItem[]
  total_overtime_hours: number
  total_comp_leave_hours: number
  total_overtime_pay: number
}

export interface LeaveBalance {
  id: string
  employee_id: string
  employee_number?: string
  employee_name?: string
  year: number
  leave_type: 'annual' | 'comp' | 'sick'
  total_days: number
  used_days: number
  remaining_days: number
  created_at?: string
}

export interface LeaveBalanceUpdateInput {
  total_days?: number
  used_days?: number
}

export interface ImportBatch {
  id: string
  file_name: string
  file_size?: number
  record_count: number
  overtime_count: number
  date_range_start?: string
  date_range_end?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  warnings?: string[]
  imported_by?: string
  imported_at?: string
  created_at?: string
}

export interface ImportBatchListResponse {
  items: ImportBatch[]
  total: number
  page: number
  page_size: number
}

export interface ImportResult {
  batch_id: string
  file_name: string
  record_count: number
  overtime_count: number
  skipped_count: number
  warnings: string[]
}

export interface AttendanceConfigItem {
  id: string
  config_key: string
  config_value: string
  description?: string
}

export interface AttendanceConfigListResponse {
  items: AttendanceConfigItem[]
}

export interface DepartmentProductionSettings {
  is_production: boolean
  production_start_time?: string
  production_end_time?: string
}

export interface AttendanceRecordFilter {
  date_from?: string
  date_to?: string
  employee_number?: string
  employee_name?: string
  department?: string
  is_abnormal?: boolean
  import_batch?: string
  page?: number
  page_size?: number
}

export interface OvertimeFilter {
  date_from?: string
  date_to?: string
  employee_number?: string
  employee_name?: string
  department?: string
  overtime_type?: string
  conversion_type?: string
  import_batch?: string
  page?: number
  page_size?: number
}
