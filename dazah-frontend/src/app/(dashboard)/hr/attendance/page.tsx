import { Card, Row, Col, Statistic } from 'antd'

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000'

export default async function AttendancePage() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  // Fetch summary data
  let totalOtHours = 0
  let totalCompHours = 0
  let totalOtPay = 0
  let workdays = 0

  try {
    const otRes = await fetch(
      `${API_BASE}/api/v1/hr/attendance/overtime/summary?year=${year}&month=${month}&group_by=department`,
      { cache: 'no-store' }
    )
    const otJson = await otRes.json()
    if (otJson.data) {
      totalOtHours = otJson.data.total_overtime_hours || 0
      totalCompHours = otJson.data.total_comp_leave_hours || 0
      totalOtPay = otJson.data.total_overtime_pay || 0
    }
  } catch {}

  try {
    const calRes = await fetch(`${API_BASE}/api/v1/hr/attendance/calendar/${year}/${month}`, { cache: 'no-store' })
    const calJson = await calRes.json()
    if (calJson.data) {
      workdays = calJson.data.workdays || 0
    }
  } catch {}

  const menuCards = [
    { title: '导入考勤', description: '上传公司考勤日报Excel，自动解析并计算加班', href: '/hr/attendance/import', color: '#1677ff' },
    { title: '考勤记录', description: '查询所有考勤记录，按条件筛选', href: '/hr/attendance/records', color: '#52c41a' },
    { title: '加班汇总', description: '查看加班统计，按部门/员工/月份汇总', href: '/hr/attendance/overtime', color: '#fa8c16' },
    { title: '工作日历', description: '管理年度节假日和调休安排', href: '/hr/attendance/calendar', color: '#722ed1' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">考勤管理</h2>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title={`${year}年${month}月应出勤`} value={workdays} suffix="天" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月加班总时长" value={totalOtHours} suffix="小时" precision={1} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月转调休" value={totalCompHours} suffix="小时" precision={1} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月加班费" value={totalOtPay} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {menuCards.map(card => (
          <Col key={card.href} span={6}>
            <a href={card.href}>
              <Card hoverable className="h-full">
                <div className="text-lg font-medium mb-2" style={{ color: card.color }}>{card.title}</div>
                <div className="text-sm text-gray-500">{card.description}</div>
              </Card>
            </a>
          </Col>
        ))}
      </Row>
    </div>
  )
}
