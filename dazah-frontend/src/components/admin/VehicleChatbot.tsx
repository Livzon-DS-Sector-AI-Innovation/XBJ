'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  Drawer,
  Button,
  Input,
  Spin,
  Avatar,
  Tag,
  Tooltip,
  Upload,
  Image,
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
  RobotOutlined,
  SendOutlined,
  ClearOutlined,
  CommentOutlined,
  UserOutlined,
  BulbOutlined,
  PictureOutlined,
  CloseCircleOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons'
import { useVehicleChatStore } from '@/stores/vehicleChat'
import { ChatAttachment } from '@/lib/api/ai'

const { TextArea } = Input

const QUICK_QUESTIONS = [
  '统计待审批的用车申请',
  '查询所有可用车辆',
  '本月用车申请总数是多少？',
  '帮我分析这张用车单据',
]

function parseThinking(content: string): {
  answer: string
  thinking: string | null
  isThinking: boolean
} {
  const openIdx = content.indexOf('<think>')
  const closeIdx = content.indexOf('</think>')

  if (openIdx !== -1 && closeIdx !== -1 && closeIdx > openIdx) {
    const thinking = content.slice(openIdx + 7, closeIdx).trim()
    const answer = (content.slice(0, openIdx) + content.slice(closeIdx + 8)).trim()
    return { answer, thinking, isThinking: false }
  }

  if (openIdx !== -1 && closeIdx === -1) {
    const thinking = content.slice(openIdx + 7).trim()
    return { answer: '', thinking, isThinking: true }
  }

  return { answer: content, thinking: null, isThinking: false }
}

export default function VehicleChatbot() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

  const {
    messages,
    isOpen,
    isLoading,
    inputValue,
    pendingAttachments,
    toggleOpen,
    setOpen,
    setInputValue,
    setPageContext,
    addAttachment,
    removeAttachment,
    sendMessage,
    clearMessages,
  } = useVehicleChatStore()

  const [previewImages, setPreviewImages] = useState<UploadFile[]>([])
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
    setPageContext({ page: 'vehicle-requests（用车申请）' })
  }, [setPageContext])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(async () => {
    if ((!inputValue.trim() && pendingAttachments.length === 0) || isLoading) return
    await sendMessage(inputValue.trim())
    setPreviewImages([])
  }, [inputValue, pendingAttachments.length, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) return false
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64Data = result.split(',')[1]
      const attachment: ChatAttachment = {
        type: 'image',
        mime_type: file.type,
        data: base64Data,
      }
      addAttachment(attachment)
      const uploadFile: UploadFile = {
        uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        status: 'done',
        originFileObj: file as any,
      }
      setPreviewImages((prev) => [...prev, uploadFile])
    }
    reader.readAsDataURL(file)
    return false
  }

  const handleRemove = (file: UploadFile) => {
    const index = previewImages.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      removeAttachment(index)
      setPreviewImages((prev) => prev.filter((f) => f.uid !== file.uid))
    }
  }

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    if (fileList.length < previewImages.length) {
      setPreviewImages(fileList)
    }
  }

  return (
    <>
      <Button
        type="primary"
        icon={<RobotOutlined />}
        onClick={toggleOpen}
        className="shadow-lg"
      >
        智能助手
      </Button>

      <Drawer
        placement="right"
        width={480}
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
            const { answer, thinking, isThinking } =
              msg.role === 'assistant'
                ? parseThinking(msg.content)
                : { answer: msg.content, thinking: null, isThinking: false }

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
                  {msg.role === 'assistant' && (thinking || isThinking) && (
                    <div className="rounded-md bg-amber-50 border border-amber-100 px-2 py-1.5">
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-0.5">
                        <BulbOutlined />
                        {isThinking ? '正在思考...' : '思考过程'}
                      </div>
                      <div className="text-xs text-amber-700 whitespace-pre-wrap leading-relaxed">
                        {thinking}
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
                    {msg.role === 'assistant' && answer ? (
                      <span>{answer}</span>
                    ) : msg.role === 'user' ? (
                      <span>{msg.content}</span>
                    ) : isLastAssistant && isLoading && !msg.content ? (
                      <Spin size="small" />
                    ) : null}
                  </div>

                  {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {msg.attachments.map((att, aIdx) => (
                        <Image
                          key={aIdx}
                          src={`data:${att.mime_type};base64,${att.data}`}
                          alt="附件"
                          width={80}
                          height={80}
                          className="rounded object-cover"
                          preview={{ mask: '预览' }}
                        />
                      ))}
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

        {/* Pending attachments preview */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-1">待发送图片</div>
            <div className="flex gap-2 flex-wrap">
              {pendingAttachments.map((att, idx) => (
                <div key={idx} className="relative">
                  <Image
                    src={`data:${att.mime_type};base64,${att.data}`}
                    alt="待发送"
                    width={64}
                    height={64}
                    className="rounded object-cover"
                  />
                  <button
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    onClick={() => {
                      removeAttachment(idx)
                      setPreviewImages((prev) => prev.filter((_, i) => i !== idx))
                    }}
                  >
                    <CloseCircleOutlined className="text-[10px]" />
                  </button>
                </div>
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
            <Tooltip title="上传图片">
              <Upload
                accept="image/*"
                beforeUpload={handleBeforeUpload}
                onRemove={handleRemove}
                onChange={handleChange}
                fileList={previewImages}
                showUploadList={false}
                multiple
              >
                <Button
                  icon={<PictureOutlined />}
                  className="self-end"
                  disabled={isLoading}
                />
              </Upload>
            </Tooltip>
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
              disabled={!inputValue.trim() && pendingAttachments.length === 0}
              className="self-end"
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            由 Moonshot AI 提供支持 · 支持图片上传
            {speechSupported && ' · 支持语音输入'}
          </div>
        </div>
      </Drawer>
    </>
  )
}
