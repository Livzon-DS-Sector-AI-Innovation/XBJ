'use client'

import { Card } from 'antd'

export default function ITTicketPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-4">IT服务工单</h1>

      {/* 飞书IT工单表单嵌入 */}
      <Card title="📝 飞书IT服务工单表单" className="mb-6">
        <iframe
          src="https://j0eukrlohu.feishu.cn/share/base/form/shrcnK683zCX3MJNouST7a6PIUh"
          style={{ width: '100%', height: '800px', border: 'none' }}
          title="飞书IT服务工单表单"
        />
      </Card>
    </div>
  )
}
