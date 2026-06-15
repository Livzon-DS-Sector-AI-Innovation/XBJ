import { createAdminChatStore } from './createAdminChatStore'

export const useItTicketChatStore = createAdminChatStore({
  welcomeMessage:
    '你好！我是智能助手。\n你可以问我关于IT报修流程、设备故障处理或相关技术问题，也可以上传故障截图。',
  clearMessage:
    '对话已清空。我是智能助手，有什么可以帮你的？',
})
