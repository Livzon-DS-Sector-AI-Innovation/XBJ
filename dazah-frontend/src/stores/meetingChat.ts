import { createAdminChatStore } from './createAdminChatStore'

export const useMeetingChatStore = createAdminChatStore({
  welcomeMessage:
    '你好！我是智能助手。\n你可以问我关于会议管理、物品领用、台账记录或相关行政问题。',
  clearMessage:
    '对话已清空。我是智能助手，有什么可以帮你的？',
})
