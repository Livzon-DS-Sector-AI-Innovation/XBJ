import { createAdminChatStore } from './createAdminChatStore'

export const useApprovalChatStore = createAdminChatStore({
  welcomeMessage:
    '你好！我是智能助手。\n你可以问我关于寄件申请流程、邮寄规定或相关行政问题。',
  clearMessage:
    '对话已清空。我是智能助手，有什么可以帮你的？',
})
