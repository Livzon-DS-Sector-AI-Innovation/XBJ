'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  Drawer,
  FloatButton,
  Input,
  Button,
  Spin,
  Avatar,
  Tag,
  Tooltip,
} from 'antd'
import {
  RobotOutlined,
  SendOutlined,
  ClearOutlined,
  CommentOutlined,
  UserOutlined,
  BulbOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons'
import { useRegulationChatStore } from '@/stores/regulationChat'
import type { Regulation } from '@/lib/api/admin/regulation'

const { TextArea } = Input

interface RegulationChatbotProps {
  regulations?: Regulation[]
  onOpenFile?: (record: Regulation) => void
}

function splitContentAndFiles(content: string): { mainContent: string; files: string[] } {
  const regex = /\n\s*相关制度(?:名称和)?文件[：:]?\s*([\s\S]*)$/
  const match = content.match(regex)
  if (!match) return { mainContent: content, files: [] }

  const mainContent = content.slice(0, match.index).trim()
  const filesText = match[1]
  const files = filesText
    .split('\n')
    .map((line) => line.replace(/^\s*[\d\.\-\*\•]+\s*/, '').trim())
    .filter((line) => line.length > 0)

  return { mainContent, files }
}

function dedupFiles(files: string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const file of files) {
    const normalized = file.toLowerCase().replace(/\.[^/.]+$/, '').replace(/\s/g, '')
    let isDup = false
    for (const existing of seen) {
      if (existing.includes(normalized) || normalized.includes(existing)) {
        isDup = true
        break
      }
    }
    if (!isDup) {
      seen.add(normalized)
      result.push(file)
    }
  }

  return result
}

function findRegulation(fileName: string, regulations: Regulation[]): Regulation | undefined {
  const normalized = fileName.toLowerCase().replace(/\s/g, '')
  return regulations.find((r) => {
    const titleNorm = (r.title || '').toLowerCase().replace(/\s/g, '')
    const fileNorm = (r.file_name || '').toLowerCase().replace(/\s/g, '')
    return (
      titleNorm === normalized ||
      fileNorm === normalized ||
      normalized.includes(titleNorm) ||
      normalized.includes(fileNorm) ||
      titleNorm.includes(normalized) ||
      fileNorm.includes(normalized)
    )
  })
}

const QUICK_QUESTIONS = [
  '请假流程是什么？',
  '加班有什么规定？',
  '报销制度是怎样的？',
  '员工福利有哪些？',
]

export default function RegulationChatbot({ regulations = [], onOpenFile }: RegulationChatbotProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

  const {
    messages,
    isOpen,
    isLoading,
    inputValue,
    toggleOpen,
    setOpen,
    setInputValue,
    sendMessage,
    clearMessages,
  } = useRegulationChatStore()

  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  // Check browser support for SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputValue((prev: string) => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : ''
        return prev + separator + transcript
      })
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [setInputValue])

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isRecording])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return
    await sendMessage(inputValue.trim())
  }, [inputValue, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        tooltip="智能助手"
        onClick={toggleOpen}
        style={{ right: 24, bottom: 24, zIndex: 9999 }}
        className="shadow-lg"
      />

      <Drawer
        placement="right"
        width={520}
        open={isOpen}
        onClose={() => setOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <span className="font-semibold">智能助手</span>
          </div>
        }
        extra={
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={clearMessages}
            disabled={isLoading}
          >
            清空
          </Button>
        }
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === 'assistant' && idx === messages.length - 1

            let displayContent = msg.content
            let relatedFiles: Regulation[] = []

            if (msg.role === 'assistant' && msg.content) {
              const { mainContent, files } = splitContentAndFiles(msg.content)
              displayContent = mainContent
              if (files.length > 0 && regulations.length > 0) {
                const deduped = dedupFiles(files).slice(0, 5)
                relatedFiles = deduped
                  .map((f) => findRegulation(f, regulations))
                  .filter((r): r is Regulation => r !== undefined)
              }
            }

            return (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  className={msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}
                  size="small"
                />
                <div className="max-w-[85%] space-y-1">
                  {msg.role === 'assistant' && msg.reasoning_content && (
                    <div className="rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5">
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-0.5">
                        <BulbOutlined />
                        思考过程
                      </div>
                      <div className="text-xs text-amber-700 whitespace-pre-wrap leading-relaxed">
                        {msg.reasoning_content}
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.role === 'assistant' && displayContent ? (
                      <span>{displayContent}</span>
                    ) : msg.role === 'user' ? (
                      <span>{msg.content}</span>
                    ) : isLastAssistant && isLoading && !displayContent ? (
                      <Spin size="small" />
                    ) : null}
                  </div>

                  {relatedFiles.length > 0 && (
                    <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
                      <div className="text-xs text-blue-600 font-medium mb-1">相关文件</div>
                      <div className="flex flex-wrap gap-2">
                        {relatedFiles.map((reg) => (
                          <Button
                            key={reg.id}
                            type="link"
                            size="small"
                            className="text-sm p-0 h-auto"
                            onClick={() => onOpenFile?.(reg)}
                          >
                            {reg.title || reg.file_name || '未命名文件'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <CommentOutlined />
              快捷提问
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <Tag
                  key={q}
                  className="cursor-pointer hover:text-blue-500 hover:border-blue-300 transition-colors"
                  onClick={() => {
                    if (!isLoading) sendMessage(q)
                  }}
                >
                  {q}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题，按 Enter 发送，Shift+Enter 换行"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isLoading}
              className="flex-1"
            />
            {speechSupported && (
              <Tooltip title={isRecording ? '点击停止录音' : '点击语音输入'}>
                <Button
                  icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                  onClick={toggleRecording}
                  danger={isRecording}
                  className="self-end"
                />
              </Tooltip>
            )}
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={isLoading}
              disabled={!inputValue.trim()}
              className="self-end"
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            由 Moonshot AI 提供支持
            {speechSupported && ' · 支持语音输入'}
          </div>
        </div>
      </Drawer>
    </>
  )
}
