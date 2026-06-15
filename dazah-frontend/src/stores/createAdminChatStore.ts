import { create } from 'zustand'
import { ChatAttachment, ChatMessage, HrPageContext, streamChat } from '@/lib/api/ai'

export interface AdminChatState {
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

export interface CreateAdminChatStoreOptions {
  welcomeMessage: string
  clearMessage: string
}

export function createAdminChatStore(options: CreateAdminChatStoreOptions) {
  return create<AdminChatState>((set, get) => ({
    messages: [
      {
        role: 'assistant',
        content: options.welcomeMessage,
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
        (type: string, text: string) => {
          set((state) => {
            const msgs = state.messages.map((msg, idx) => {
              if (idx === state.messages.length - 1 && msg.role === 'assistant') {
                if (type === 'reasoning') {
                  return {
                    ...msg,
                    reasoning_content: (msg.reasoning_content || '') + text,
                  }
                }
                return { ...msg, content: msg.content + text }
              }
              return msg
            })
            return { messages: msgs }
          })
        },
        () => {
          set({ isLoading: false })
        },
        (err) => {
          set((state) => {
            const last = state.messages[state.messages.length - 1]
            const hasEmptyAssistant = last?.role === 'assistant' && last?.content === ''
            const msgs = hasEmptyAssistant
              ? state.messages.slice(0, -1)
              : [...state.messages]
            return {
              messages: [
                ...msgs,
                { role: 'assistant', content: `[系统错误] ${err.message}` },
              ],
              isLoading: false,
            }
          })
        },
      )
    },

    clearMessages: () =>
      set({
        messages: [
          {
            role: 'assistant',
            content: options.clearMessage,
          },
        ],
        inputValue: '',
        pendingAttachments: [],
      }),
  }))
}
