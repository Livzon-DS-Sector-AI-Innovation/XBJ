import { createAdminChatStore } from './createAdminChatStore'

export const useVehicleInfoChatStore = createAdminChatStore({
  welcomeMessage:
    '你好！我是智能助手。\n你可以问我关于车辆信息、车辆状态查询或车队管理相关问题，也可以上传车辆照片。',
  clearMessage:
    '对话已清空。我是智能助手，有什么可以帮你的？',
})
