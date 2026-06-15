import { create } from 'zustand'
import { ChatAttachment, ChatMessage, HrPageContext, streamChat } from '@/lib/api/ai'

interface VehicleChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  inputValue: string
  pageContext: HrPageContext | null
  pendingAttachments: ChatAttachment[]

  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setInputValue: (value: string | ((prev: string) => string)) => void
  setPageContext: (ctx: HrPageContext | null) => void
  addAttachment: (attachment: ChatAttachment) => void
  removeAttachment: (index: number) => void
  clearAttachments: () => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

export const useVehicleChatStore = create<VehicleChatState>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      content:
        '你好！我是智能助手。\n你可以上传用车单据、车辆照片等图片，或问我关于用车申请、车辆信息查询的问题。',
    },
  ],
  isOpen: false,
  isLoading: false,
  inputValue: '',
  pageContext: null,
  pendingAttachments: [],

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setInputValue: (value: string | ((prev: string) => string)) =>
    set((state) => ({
      inputValue:
        typeof value === 'function'
          ? (value as (prev: string) => string)(state.inputValue)
          : value,
    })),
  setPageContext: (ctx) => set({ pageContext: ctx }),

  addAttachment: (attachment) =>
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, attachment],
    })),
  removeAttachment: (index) =>
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((_, i) => i !== index),
    })),
  clearAttachments: () => set({ pendingAttachments: [] }),

  sendMessage: async (content: string) => {
    if (!content.trim() && get().pendingAttachments.length === 0) return

    const { messages, pageContext, pendingAttachments } = get()
    const userMsg: ChatMessage = {
      role: 'user',
      content: content.trim(),
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }

    set({
      messages: [...messages, userMsg, assistantMsg],
      isLoading: true,
      inputValue: '',
      pendingAttachments: [],
    })

    const allMessages = [...messages, userMsg]

    await streamChat(
      allMessages,
      pageContext,
      (chunk) => {
        set((state) => {
          const msgs = [...state.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            last.content += chunk
          }
          return { messages: msgs }
        })
      },
      () => {
        set({ isLoading: false })
      },
      (err) => {
        set((state) => {
          const msgs = [...state.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            last.content += `\n\n[错误] ${err.message}`
          }
          return { messages: msgs, isLoading: false }
        })
      },
    )
  },

  clearMessages: () =>
    set({
      messages: [
        {
          role: 'assistant',
          content:
            '对话已清空。我是智能助手，可以帮你查询用车申请、车辆信息，或分析上传的图片。',
        },
      ],
      inputValue: '',
      pendingAttachments: [],
    }),
}))
