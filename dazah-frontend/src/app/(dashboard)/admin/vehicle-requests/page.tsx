'use client'

import { Card } from 'antd'
import { VehicleChatbot } from '@/components/admin'

export default function VehicleRequestPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-4">用车申请</h1>

      {/* 飞书表单嵌入 */}
      <Card title="📝 飞书用车申请表单" className="mb-6">
        <iframe
          src="https://j0eukrlohu.feishu.cn/share/base/form/shrcnFLV3uTwGYB2t6kDEbxJfre"
          style={{ width: '100%', height: '800px', border: 'none' }}
          title="飞书用车申请表单"
        />
      </Card>

      {/* 分隔标题 + AI 助手 */}
      <div className="flex items-center justify-between my-4 border-t border-gray-200 pt-4">
        <h2 className="text-lg font-semibold">用车数据</h2>
        <VehicleChatbot />
      </div>

      {/* 飞书数据视图嵌入 */}
      <Card title="📊 飞书用车申请数据视图" className="mb-6">
        <iframe
          src="https://j0eukrlohu.feishu.cn/share/base/view/shrcnNq9B8CXiLibG96wRLqVdrg"
          style={{ width: '100%', height: '600px', border: 'none' }}
          title="飞书用车申请数据视图"
        />
      </Card>
    </div>
  )
}
