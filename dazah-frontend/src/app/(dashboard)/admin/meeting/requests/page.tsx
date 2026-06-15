'use client'

import { useEffect } from 'react'
import { SmartAssistant } from '@/components/admin'
import { useMeetingChatStore } from '@/stores/meetingChat'

export default function MeetingRequestPage() {
  const store = useMeetingChatStore()

  const { setPageContext } = store

  useEffect(() => {
    setPageContext({ page: 'meeting-requests（领用申请）' })
  }, [setPageContext])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <iframe
        src="https://j0eukrlohu.feishu.cn/share/base/form/shrcngZbqXpLyfbg38hcPVvyghg"
        className="w-full flex-1 border-none"
        title="飞书领用申请表单"
      />

      <SmartAssistant
        store={store}
        moduleName="智能助手"
        quickQuestions={[
          '领用申请流程是什么？',
          '如何查询领用记录？',
          '领用物品有哪些？',
        ]}
      />
    </div>
  )
}
