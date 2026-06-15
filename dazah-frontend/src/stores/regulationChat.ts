import { create } from 'zustand'
import { ChatAttachment, ChatMessage, HrPageContext, streamChat } from '@/lib/api/ai'
import { fetchRegulations } from '@/lib/api/admin/regulation'

interface RegulationChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  inputValue: string
  pendingAttachments: ChatAttachment[]
  pageContext: HrPageContext | null

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

const MAX_CONTENT_LENGTH = 8000

async function buildSystemPrompt(): Promise<string> {
  try {
    const res = await fetchRegulations({ page_size: 100 })
    const regulations = res.data || []
    if (regulations.length === 0) {
      return '你是企业规章制度智能助手。当前暂无上传的规章制度文件，请提示用户先上传制度文件。'
    }

    const listText = regulations
      .map(
        (r) =>
          `【制度名称】${r.title}\n【文件】${r.file_name || '-'}\n【内容】${r.content.slice(0, MAX_CONTENT_LENGTH)}${r.content.length > MAX_CONTENT_LENGTH ? '\n...(内容过长，已截断)' : ''}`
      )
      .join('\n\n---\n\n')

    return `你是企业规章制度智能助手。请严格根据以下已上传的规章制度内容回答员工的问题。

已上传的规章制度如下：

${listText}

回答要求：
1. 只基于上方提供的制度内容回答，不要调用外部知识
2. 如果问题涉及的内容不在制度中，明确告知"根据现有制度文件，暂未找到相关规定"
3. 如果涉及多个制度，请分别说明
4. 仅在确实引用了某个制度的具体内容时，才在回答末尾的"相关制度文件："段落中列出该制度的名称。如果没有引用任何制度的具体内容，则不要列出相关制度文件。`
  } catch {
    return '你是企业规章制度智能助手。当前无法获取规章制度数据，请稍后重试。'
  }
}

export const useRegulationChatStore = create<RegulationChatState>((set, get) => ({
  messages: [
    {
      role: 'assistant',
      content:
        '你好！我是智能助手。\n你可以搜索已上传的规章制度，我会帮你找到相关内容并解答问题。',
    },
  ],
  isOpen: false,
  isLoading: false,
  inputValue: '',
  pendingAttachments: [],
  pageContext: null,

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

    const { messages, pendingAttachments, pageContext } = get()
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

    // Build system prompt with current regulations
    const systemPrompt = await buildSystemPrompt()
    const systemMsg: ChatMessage = { role: 'system', content: systemPrompt }

    // Only include last 4 messages + system prompt to manage token usage
    const recentMessages = messages.slice(-4)
    const allMessages = [systemMsg, ...recentMessages, userMsg]

    await streamChat(
      allMessages,
      pageContext,
      (type, text) => {
        set((state) => {
          const msgs = [...state.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            if (type === 'content') {
              last.content += text
            }
            if (type === 'reasoning') {
              last.reasoning_content = (last.reasoning_content || '') + text
            }
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
      }
    )
  },

  clearMessages: () =>
    set({
      messages: [
        {
          role: 'assistant',
          content:
            '对话已清空。我是智能助手，可以帮你查询已上传的规章制度内容。',
        },
      ],
      inputValue: '',
      pendingAttachments: [],
    }),
}))
