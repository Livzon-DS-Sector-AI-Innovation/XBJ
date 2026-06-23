'use client'

import { useState } from 'react'
import { Table, Card, Select, Statistic, Row, Col } from 'antd'
import type { OvertimeSummaryItem } from '@/types/hr'

interface Props {
  initialItems: OvertimeSummaryItem[]
  initialYear: number
}

export default function OvertimeSummaryClient({ initialItems, initialYear }: Props) {
  const [items, setItems] = useState(initialItems)
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState<number | undefined>(undefined)
  const [groupBy, setGroupBy] = useState('department')
  const [loading, setLoading] = useState(false)

  const doQuery = async (y: number, m?: number, gb?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('year', String(y))
      params.set('group_by', gb || groupBy)
      if (m) params.set('month', String(m))
      const res = await fetch(`/api/v1/hr/attendance/overtime/summary?${params}`)
      const json = await res.json()
      if (json.code === 0 || json.code === 200) {
        setItems(json.data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const totalOT = items.reduce((s, i) => s + i.total_ot_hours, 0)
  const totalComp = items.reduce((s, i) => s + i.comp_leave_hours, 0)
  const totalPay = items.reduce((s, i) => s + i.overtime_pay, 0)

  const columns = [
    ...(groupBy === 'department' ? [{ title: '部门', dataIndex: 'department', key: 'department' }] : []),
    ...(groupBy === 'employee' ? [
      { title: '工号', dataIndex: 'employee_number', key: 'employee_number' },
      { title: '姓名', dataIndex: 'employee_name', key: 'employee_name' },
      { title: '部门', dataIndex: 'department', key: 'department' },
    ] : []),
    ...(groupBy === 'month' ? [{ title: '月份', dataIndex: 'month', key: 'month', render: (v: number) => `${v}月` }] : []),
    { title: '工作日加班(h)', dataIndex: 'weekday_ot_hours', key: 'weekday_ot_hours' },
    { title: '休息日加班(h)', dataIndex: 'weekend_ot_hours', key: 'weekend_ot_hours' },
    { title: '节假日加班(h)', dataIndex: 'holiday_ot_hours', key: 'holiday_ot_hours' },
    { title: '加班合计(h)', dataIndex: 'total_ot_hours', key: 'total_ot_hours' },
    { title: '转调休(h)', dataIndex: 'comp_leave_hours', key: 'comp_leave_hours' },
    { title: '加班费(元)', dataIndex: 'overtime_pay', key: 'overtime_pay', render: (v: number) => `¥${v.toFixed(2)}` },
  ]

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({ label: `${2024 + i}年`, value: 2024 + i }))
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={year} onChange={(v) => { setYear(v); doQuery(v, month, groupBy) }} options={yearOptions} style={{ width: 100 }} />
        <Select value={month} onChange={(v) => { setMonth(v); doQuery(year, v, groupBy) }} options={monthOptions} placeholder="全年" allowClear style={{ width: 100 }} />
        <Select value={groupBy} onChange={(v) => { setGroupBy(v); doQuery(year, month, v) }} options={[
          { label: '按部门', value: 'department' },
          { label: '按员工', value: 'employee' },
          { label: '按月份', value: 'month' },
        ]} style={{ width: 120 }} />
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card><Statistic title="加班总时长" value={totalOT} suffix="小时" precision={1} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="转调休合计" value={totalComp} suffix="小时" precision={1} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="加班费合计" value={totalPay} prefix="¥" precision={2} /></Card>
        </Col>
      </Row>

      <Card title="加班明细">
        <Table dataSource={items} columns={columns} rowKey={(r, i) => String(i)} loading={loading} pagination={{ pageSize: 50 }} />
      </Card>
    </div>
  )
}
