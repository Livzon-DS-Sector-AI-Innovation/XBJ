'use client'

import { useState } from 'react'
import { Button, Card, DatePicker, Dropdown, Form, Input, Modal, Radio, Select, Space, Table, Tag, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, FileWordOutlined, FileExcelOutlined, BookOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import TrainingSessionDetailModal from './TrainingSessionDetailModal'
import {
  updateTrainingSession,
  deleteTrainingSession,
  updateTrainingSessionStatus,
} from '@/actions/hr'
import {
  generateTrainingNotification,
  generateTrainingSignInSheet,
  generateTrainingEvaluation,
  fetchTrainingSessionSelectTasks,
  fetchTrainingLedgerPages,
  createTrainingLedger,
  createTrainingLedgerPage,
} from '@/lib/api/hr'
import type { TrainingSession, SelectTask } from '@/types/hr'

const { RangePicker } = DatePicker

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  notified: { label: '已通知', color: 'blue' },
  selecting: { label: '选择中', color: 'orange' },
  confirmed: { label: '已确认', color: 'cyan' },
  evaluated: { label: '已评估', color: 'purple' },
  archived: { label: '已归档', color: 'green' },
}

interface TrainingSessionListClientProps {
  initialData: TrainingSession[]
  initialMeta?: {
    page: number
    page_size: number
    total: number
  }
}

export default function TrainingSessionListClient({
  initialData,
  initialMeta,
}: TrainingSessionListClientProps) {
  const [data, setData] = useState<TrainingSession[]>(initialData)
  const [meta, setMeta] = useState(initialMeta)
  const [loading, setLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<TrainingSession | null>(null)
  const [detailStartEditing, setDetailStartEditing] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [ledgerTypeOpen, setLedgerTypeOpen] = useState(false)
  const [ledgerTargets, setLedgerTargets] = useState<{ name: string; number: string }[]>([])
  const [pendingRecord, setPendingRecord] = useState<TrainingSession | null>(null)
  const [filters, setFilters] = useState({
    department: '',
    keyword: '',
    status: '',
    date_from: '',
    date_to: '',
  })

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const { fetchTrainingSessionsAction } = await import('@/actions/hr')
      const res = await fetchTrainingSessionsAction({
        department: filters.department || undefined,
        keyword: filters.keyword || undefined,
        status: filters.status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        page,
        page_size: pageSize,
      })
      setData(res.data || [])
      setMeta(res.meta)
    } catch (err: any) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setDetailRecord(null)
    setDetailStartEditing(true)
    setDetailOpen(true)
  }

  const handleEdit = (record: TrainingSession) => {
    setDetailRecord(record)
    setDetailStartEditing(true)
    setDetailOpen(true)
  }

  const handleDetail = (record: TrainingSession) => {
    setDetailRecord(record)
    setDetailStartEditing(false)
    setDetailOpen(true)
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setDetailRecord(null)
  }

  const handleDelete = (record: TrainingSession) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除培训记录「${record.subject}」吗？`,
      onOk: async () => {
        try {
          await deleteTrainingSession(record.id)
          message.success('删除成功')
          handleRefresh()
        } catch (err: any) {
          message.error(err.message || '删除失败')
        }
      },
    })
  }

  const handleStatusChange = async (record: TrainingSession, status: string) => {
    try {
      await updateTrainingSessionStatus(record.id, status)
      message.success(`状态更新为：${STATUS_MAP[status]?.label || status}`)
      handleRefresh()
    } catch (err: any) {
      message.error(err.message || '状态更新失败')
    }
  }

  const handleGenerateNotification = async (record: TrainingSession) => {
    try {
      const payload = {
        department: record.department,
        training_date: record.training_date,
        subject: record.subject,
        training_time_start: record.training_time_start,
        training_time_end: record.training_time_end,
        location: record.location,
        trainer: record.trainer,
        content: record.content,
        trainee_names: record.trainee_departments || [],
        issuer_department: record.issuer_department || record.department,
        issue_date: record.issue_date || record.training_date,
      }
      await generateTrainingNotification(payload, record.factory || 'old')
      message.success('培训通知已导出')
    } catch (err: any) {
      message.error(err.message || '生成失败')
    }
  }

  const handleGenerateSignInSheet = async (record: TrainingSession) => {
    try {
      const payload = {
        training_date: record.training_date,
        training_time_start: record.training_time_start,
        training_time_end: record.training_time_end,
        department: (record.trainee_departments || []).join('、') || record.department,
        topic: [record.subject, record.content].filter(Boolean).join(' '),
        instructor: record.trainer,
        location: record.location,
        training_method: record.training_method,
        employee_names: record.employee_names || [],
      }
      await generateTrainingSignInSheet(payload, record.factory as 'old' | 'new')
      message.success('签到表已生成')
    } catch (err: any) {
      message.error(err.message || '生成失败')
    }
  }

  const handleGenerateEvaluation = async (record: TrainingSession) => {
    try {
      let durationHours: number | undefined = undefined
      if (record.training_time_start && record.training_time_end) {
        const start = dayjs(record.training_time_start, 'HH:mm')
        const end = dayjs(record.training_time_end, 'HH:mm')
        const diffMinutes = end.diff(start, 'minute')
        durationHours = Math.round(diffMinutes / 30) / 2
      }
      const payload = {
        subject: [record.subject, record.content].filter(Boolean).join(' '),
        training_date: record.training_date,
        duration_hours: durationHours,
        training_method: record.training_method,
        trainer_type: record.trainer,
        trainer: record.trainer,
        textbook: (record.trainee_departments || []).join('、'),
        expected_count: (record.employee_names || []).length,
      }
      await generateTrainingEvaluation(payload, record.factory as 'old' | 'new')
      message.success('培训效果评估表已生成')
      await handleStatusChange(record, 'evaluated')
    } catch (err: any) {
      message.error(err.message || '生成失败')
    }
  }

  const handleAddToLedger = async (record: TrainingSession) => {
    let selectedNames = record.employee_names || []
    let selectedNumbers = record.employee_numbers || []

    if (selectedNames.length === 0 && record.select_tasks?.length) {
      for (const t of record.select_tasks) {
        if (t.status === 'submitted') {
          if (t.employee_names) selectedNames.push(...t.employee_names)
          if (t.employee_numbers) selectedNumbers.push(...t.employee_numbers)
        }
      }
    }

    if (selectedNames.length === 0) {
      message.warning('该培训记录没有受训人员，无法添加台账')
      return
    }

    const numberMap: Record<string, string> = {}
    selectedNames.forEach((name: string, idx: number) => {
      if (selectedNumbers[idx]) numberMap[name] = selectedNumbers[idx]
    })

    const targets: { name: string; number: string }[] = []
    for (const name of selectedNames) {
      const num = numberMap[name]
      if (num) {
        targets.push({ name, number: num })
      }
    }

    if (targets.length === 0) {
      message.warning('所选人员缺少工号，无法添加台账')
      return
    }

    setLedgerTargets(targets)
    setPendingRecord(record)
    setLedgerTypeOpen(true)
  }

  const handleLedgerTypeSelect = async (ledgerType: string) => {
    setLedgerTypeOpen(false)
    const record = pendingRecord!
    const targets = ledgerTargets
    if (!record || targets.length === 0) return

    const typeLabel = ledgerType === 'sop' ? 'SOP培训' : '事件培训'
    try {
      const existingRes = await fetchTrainingLedgerPages()
      const existingNumbers = new Set(
        (existingRes.data || [])
          .filter((p: any) => p.ledger_type === ledgerType)
          .map((p: any) => p.employee_number)
      )
      const noPage = targets.filter((t) => !existingNumbers.has(t.number))
      const created: string[] = []
      for (const p of noPage) {
        try {
          await createTrainingLedgerPage({
            employee_number: p.number,
            employee_name: p.name,
            ledger_type: ledgerType,
          })
          created.push(p.name)
        } catch (err: any) {
          console.error('创建台账页面失败:', p.name, err)
        }
      }
      if (created.length > 0) {
        message.success(`已为 ${created.join('、')} 创建${typeLabel}台账页面`)
      }

      let durationHours: number | undefined = undefined
      if (record.training_time_start && record.training_time_end) {
        const start = dayjs(record.training_time_start, 'HH:mm')
        const end = dayjs(record.training_time_end, 'HH:mm')
        const diffMinutes = end.diff(start, 'minute')
        durationHours = Math.round(diffMinutes / 30) / 2
      }
      const trainerFull = record.trainer
        ? `${record.department}/${record.trainer}`
        : record.department

      for (const target of targets) {
        await createTrainingLedger({
          employee_number: target.number,
          training_date: record.training_date,
          training_subject: record.subject,
          training_method: record.training_method || '',
          duration_hours: durationHours,
          trainer: trainerFull,
          source_type: 'notification',
          ledger_type: ledgerType,
        })
      }
      message.success(`已为 ${targets.map((t) => t.name).join('、')} 添加到${typeLabel}台账，页面即将刷新`)
      await handleStatusChange(record, 'archived')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      message.error(err.message || '添加失败')
    }
  }

  const handleRefreshSelectStatus = async (record: TrainingSession) => {
    try {
      const res = await fetchTrainingSessionSelectTasks(record.id)
      const tasks: SelectTask[] = res.data || []
      if (tasks.length === 0) {
        message.info('暂无选择任务')
        handleRefresh()
        return
      }
      const allSubmitted = tasks.every((t) => t.status === 'submitted')
      if (allSubmitted) {
        // 合并所有已提交部门的人员
        const allNames: string[] = []
        const allNumbers: string[] = []
        for (const t of tasks) {
          if (t.employee_names) allNames.push(...t.employee_names)
          if (t.employee_numbers) allNumbers.push(...t.employee_numbers)
        }
        await updateTrainingSession(record.id, {
          employee_names: allNames,
          employee_numbers: allNumbers,
          status: 'confirmed',
        })
        message.success(`所有部门已完成选择，共 ${allNames.length} 人，已自动确认`)
      } else {
        const pendingDepts = tasks.filter((t) => t.status !== 'submitted').map((t) => t.department)
        const submittedDepts = tasks.filter((t) => t.status === 'submitted').map((t) => t.department)
        message.info(
          `已提交：${submittedDepts.join('、') || '无'}；待提交：${pendingDepts.join('、')}`
        )
      }
      handleRefresh()
    } catch (err: any) {
      message.error(err.message || '刷新失败')
    }
  }

  const getWorkflowActions = (record: TrainingSession) => {
    const status = record.status || 'draft'
    const items: { key: string; label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] = []

    // 导出培训通知：除 archived 外都可用
    if (status !== 'archived') {
      items.push({ key: 'notify', label: '导出培训通知', icon: <FileWordOutlined />, onClick: () => handleGenerateNotification(record) })
    }
    // 刷新选择状态（选择中）
    if (status === 'selecting') {
      items.push({ key: 'refresh-status', label: '刷新选择状态', icon: <ReloadOutlined />, onClick: () => handleRefreshSelectStatus(record) })
      items.push({ key: 'confirm', label: '确认人员', icon: <CheckCircleOutlined />, onClick: () => handleStatusChange(record, 'confirmed') })
    }
    // 导出签到表 + 评估表：notified 起就可见
    if (['notified', 'selecting', 'confirmed', 'evaluated', 'archived'].includes(status)) {
      items.push({ key: 'signin', label: '导出签到表', icon: <FileExcelOutlined />, onClick: () => handleGenerateSignInSheet(record) })
      items.push({ key: 'eval', label: '导出培训效果评估表', icon: <FileWordOutlined />, onClick: () => handleGenerateEvaluation(record) })
    }
    if (['evaluated', 'confirmed', 'archived'].includes(status)) {
      items.push({ key: 'ledger', label: '添加到培训台账', icon: <BookOutlined />, onClick: () => handleAddToLedger(record) })
    }

    items.push({ key: 'edit', label: '编辑', icon: <EditOutlined />, onClick: () => handleEdit(record) })
    items.push({ key: 'delete', label: '删除', icon: <DeleteOutlined />, onClick: () => handleDelete(record), danger: true })

    return items
  }

  const columns = [
    {
      title: '培训日期',
      dataIndex: 'training_date',
      width: 120,
      render: (v: string) => v,
    },
    {
      title: '培训主题',
      dataIndex: 'subject',
      width: 200,
      render: (v: string, record: TrainingSession) => (
        <a
          className="font-medium cursor-pointer hover:underline"
          onClick={() => handleDetail(record)}
        >
          {v}
        </a>
      ),
    },
    {
      title: '主办部门',
      dataIndex: 'department',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => {
        const cfg = STATUS_MAP[v] || { label: v, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: '选择进度',
      dataIndex: 'select_tasks',
      width: 180,
      render: (tasks: SelectTask[] | undefined, record: TrainingSession) => {
        if (!tasks || tasks.length === 0) {
          if (record.status === 'draft' || record.status === 'notified') return <span className="text-gray-400">未发送</span>
          return <span className="text-gray-400">-</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tasks.map((t, idx) => (
              <Tag key={idx} color={t.status === 'submitted' ? 'green' : 'orange'}>
                {t.department}
                {t.status === 'submitted' && t.employee_names?.length ? `(${t.employee_names.length}人)` : ''}
              </Tag>
            ))}
          </div>
        )
      },
    },
    {
      title: '厂区',
      dataIndex: 'factory',
      width: 80,
      render: (v: string) => (v === 'new' ? <Tag color="blue">新厂</Tag> : <Tag>旧厂</Tag>),
    },
    {
      title: '培训时间',
      width: 140,
      render: (_: any, record: TrainingSession) =>
        record.training_time_start && record.training_time_end
          ? `${record.training_time_start} ~ ${record.training_time_end}`
          : '-',
    },
    {
      title: '培训地点',
      dataIndex: 'location',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '培训师',
      dataIndex: 'trainer',
      width: 120,
      render: (v: string) => v || '-',
    },
    {
      title: '培训方式',
      dataIndex: 'training_method',
      width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '受训人数',
      width: 110,
      render: (_: any, record: TrainingSession) => {
        const tasks = record.select_tasks
        if (!tasks || tasks.length === 0) {
          // 旧记录或未发送选择任务：显示已确认的人数
          return record.employee_names?.length || 0
        }
        const allSubmitted = tasks.every((t) => t.status === 'submitted')
        if (allSubmitted) {
          // 所有部门已提交，汇总人数
          let total = 0
          for (const t of tasks) {
            total += t.employee_names?.length || 0
          }
          return total
        }
        // 还有部门未提交，显示进度
        const submitted = tasks.filter((t) => t.status === 'submitted').length
        return <span className="text-orange-500">{submitted}/{tasks.length} 部门已选</span>
      },
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: TrainingSession) => {
        const actions = getWorkflowActions(record)
        return (
          <Dropdown
            menu={{ items: actions.map((a) => ({ key: a.key, label: a.label, icon: a.icon, danger: a.danger, onClick: a.onClick })) }}
            placement="bottomRight"
          >
            <Button size="small">
              操作 <DownOutlined />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <Form layout="inline" className="mb-4 flex-wrap gap-y-2">
          <Form.Item label="主办部门">
            <Input
              placeholder="部门筛选"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              allowClear
            />
          </Form.Item>
          <Form.Item label="关键词">
            <Input
              placeholder="主题/培训师"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              allowClear
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="全部状态"
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              className="w-36"
              options={Object.entries(STATUS_MAP).map(([key, cfg]) => ({ value: key, label: cfg.label }))}
            />
          </Form.Item>
          <Form.Item label="日期范围">
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    date_from: dates[0]?.format('YYYY-MM-DD') || '',
                    date_to: dates[1]?.format('YYYY-MM-DD') || '',
                  })
                } else {
                  setFilters({ ...filters, date_from: '', date_to: '' })
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleRefresh}>
                查询
              </Button>
              <Button onClick={() => setFilters({ department: '', keyword: '', status: '', date_from: '', date_to: '' })}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">培训列表</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建培训
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={
            meta
              ? {
                  current: page,
                  pageSize: pageSize,
                  total: meta.total,
                  onChange: (p, ps) => {
                    setPage(p)
                    setPageSize(ps || 20)
                    handleRefresh()
                  },
                }
              : false
          }
          scroll={{ x: 1400 }}
        />
      </Card>

      <TrainingSessionDetailModal
        open={detailOpen}
        record={detailRecord}
        startEditing={detailStartEditing}
        onClose={handleDetailClose}
        onUpdated={handleRefresh}
      />

      <Modal
        title="请选择添加到哪一个台账"
        open={ledgerTypeOpen}
        onCancel={() => setLedgerTypeOpen(false)}
        footer={null}
        width={400}
      >
        <div className="flex flex-col gap-4 py-4">
          <Button
            type="primary"
            size="large"
            block
            onClick={() => handleLedgerTypeSelect('sop')}
          >
            员工SOP培训台账
          </Button>
          <Button
            size="large"
            block
            onClick={() => handleLedgerTypeSelect('event')}
          >
            员工事件台账
          </Button>
        </div>
      </Modal>
    </div>
  )
}
