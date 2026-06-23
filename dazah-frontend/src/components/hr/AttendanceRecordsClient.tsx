'use client'

import { useState } from 'react'
import { Table, DatePicker, Input, Select, Button, Card, Tag, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { AttendanceRecord, AttendanceRecordFilter } from '@/types/hr'

const { RangePicker } = DatePicker

interface Props {
  initialRecords: AttendanceRecord[]
  initialTotal: number
}

export default function AttendanceRecordsClient({ initialRecords, initialTotal }: Props) {
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<AttendanceRecordFilter>({ page: 1, page_size: 20 })

  const doSearch = async (newFilter: Partial<AttendanceRecordFilter>) => {
    const f = { ...filter, ...newFilter, page: 1 }
    setFilter(f)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)) })
      const res = await fetch(`/api/v1/hr/attendance/records?${params}`)
      const json = await res.json()
      if (json.code === 0 || json.code === 200) {
        setRecords(json.data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (page: number, pageSize: number) => {
    const f = { ...filter, page, page_size: pageSize }
    setFilter(f)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)) })
      const res = await fetch(`/api/v1/hr/attendance/records?${params}`)
      const json = await res.json()
      if (json.code === 0 || json.code === 200) {
        setRecords(json.data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '日期', dataIndex: 'record_date', key: 'record_date', width: 110 },
    { title: '工号', dataIndex: 'employee_number', key: 'employee_number', width: 100 },
    { title: '姓名', dataIndex: 'employee_name', key: 'employee_name', width: 80 },
    { title: '部门', dataIndex: 'department_name', key: 'department_name', width: 100 },
    { title: '班次', dataIndex: 'shift', key: 'shift', width: 120 },
    {
      title: '异常', dataIndex: 'is_abnormal', key: 'is_abnormal', width: 70,
      render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>,
    },
    { title: '出勤(min)', dataIndex: 'actual_minutes', key: 'actual_minutes', width: 90 },
    {
      title: '上班打卡', dataIndex: 'clock_in', key: 'clock_in', width: 150,
      render: (v: string) => v ? new Date(v).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      title: '下班打卡', dataIndex: 'clock_out', key: 'clock_out', width: 150,
      render: (v: string) => v ? new Date(v).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    { title: '迟到(min)', dataIndex: 'late_minutes', key: 'late_minutes', width: 85 },
    { title: '早退(min)', dataIndex: 'early_minutes', key: 'early_minutes', width: 85 },
    { title: '旷工(天)', dataIndex: 'absent_days', key: 'absent_days', width: 85 },
    { title: '年假', dataIndex: 'annual_leave_days', key: 'annual_leave_days', width: 65 },
    { title: '事假', dataIndex: 'personal_leave', key: 'personal_leave', width: 65 },
    { title: '调休', dataIndex: 'comp_leave', key: 'comp_leave', width: 65 },
  ]

  return (
    <Card title="考勤记录">
      <div className="flex flex-wrap gap-3 mb-4">
        <RangePicker
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              doSearch({ date_from: dates[0].format('YYYY-MM-DD'), date_to: dates[1].format('YYYY-MM-DD') })
            } else {
              doSearch({ date_from: undefined, date_to: undefined })
            }
          }}
        />
        <Input
          placeholder="工号" style={{ width: 120 }}
          onPressEnter={(e) => doSearch({ employee_number: (e.target as HTMLInputElement).value })}
        />
        <Input
          placeholder="姓名" style={{ width: 120 }}
          onPressEnter={(e) => doSearch({ employee_name: (e.target as HTMLInputElement).value })}
        />
        <Input
          placeholder="部门" style={{ width: 120 }}
          onPressEnter={(e) => doSearch({ department: (e.target as HTMLInputElement).value })}
        />
        <Select
          placeholder="异常筛选" style={{ width: 120 }} allowClear
          onChange={(v) => doSearch({ is_abnormal: v })}
          options={[
            { label: '正常', value: false },
            { label: '异常', value: true },
          ]}
        />
        <Button icon={<SearchOutlined />} onClick={() => doSearch({})}>查询</Button>
      </div>

      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
        pagination={{
          current: filter.page,
          pageSize: filter.page_size,
          total: initialTotal,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </Card>
  )
}
