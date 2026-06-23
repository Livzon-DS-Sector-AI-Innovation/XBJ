'use client'

import { useState } from 'react'
import { Card, Button, Select, Table, Tag, Space, message } from 'antd'
import type { CalendarMonth } from '@/types/hr'

interface Props {
  initialMonths: CalendarMonth[]
  initialYear: number
}

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function AttendanceCalendarClient({ initialMonths, initialYear }: Props) {
  const [months, setMonths] = useState(initialMonths)
  const [year, setYear] = useState(initialYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)

  const handleInitYear = async (y: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/hr/attendance/calendar/init/${y}`, { method: 'POST' })
      const json = await res.json()
      if (json.code === 0 || json.code === 200) {
        message.success(json.message)
        // Reload
        const res2 = await fetch(`/api/v1/hr/attendance/calendar/${y}`)
        const json2 = await res2.json()
        if (json2.code === 0 || json2.code === 200) {
          setMonths(json2.data.months)
          setYear(y)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const current = months.find(m => m.month === selectedMonth)
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({ label: `${2024 + i}年`, value: 2024 + i }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={year} onChange={(v) => {
          setYear(v)
          fetch(`/api/v1/hr/attendance/calendar/${v}`)
            .then(r => r.json())
            .then(j => { if (j.code === 0 || j.code === 200) setMonths(j.data.months) })
        }} options={yearOptions} style={{ width: 100 }} />
        <Select value={selectedMonth} onChange={setSelectedMonth} options={
          Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }))
        } style={{ width: 100 }} />
        <Button type="primary" loading={loading} onClick={() => handleInitYear(year)}>
          初始化 {year} 年日历
        </Button>
      </div>

      {current && (
        <Card title={`${year}年${selectedMonth}月 — 应出勤 ${current.workdays} 天 | 节假日 ${current.holidays} 天 | 休息 ${current.rest_days} 天`}>
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center font-medium py-1 bg-gray-100">{d}</div>
            ))}
            {/* Pad for first day of month */}
            {current.days.length > 0 && (() => {
              const firstDay = current.days[0].day_of_week
              return Array.from({ length: firstDay }, (_, i) => <div key={`pad-${i}`} className="h-16 border" />)
            })()}
            {current.days.map(d => {
              const bgColor = d.day_type === 'holiday' ? 'bg-red-50' :
                d.day_type === 'weekend' && !d.is_workday ? 'bg-gray-50' :
                d.is_workday && d.day_type === 'weekend' ? 'bg-yellow-50' : 'bg-white'
              const tagColor = d.day_type === 'holiday' ? 'red' :
                d.day_type === 'weekend' && d.is_workday ? 'orange' : undefined
              return (
                <div key={d.date} className={`h-16 border p-1 text-xs ${bgColor}`}>
                  <div className="font-medium">{d.day}</div>
                  {tagColor && <Tag color={tagColor} className="text-[10px] leading-none px-1 py-0">
                    {d.holiday_name || (d.is_workday ? '调休上班' : '周末')}
                  </Tag>}
                  {!tagColor && d.day_type === 'weekend' && <Tag className="text-[10px] leading-none px-1 py-0">周末</Tag>}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
