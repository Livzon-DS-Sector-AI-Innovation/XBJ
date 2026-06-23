'use client'

import { useState } from 'react'
import { Upload, Button, Card, Table, message, Tag, Space } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import type { ImportResult, ImportBatch } from '@/types/hr'

const { Dragger } = Upload

interface Props {
  batches: ImportBatch[]
}

export default function AttendanceImportClient({ batches }: Props) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file } = options
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file as File)
      const res = await fetch('/api/v1/hr/attendance/import', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.code === 0 || json.code === 200) {
        setResult(json.data)
        message.success(json.message || '导入成功')
      } else {
        message.error(json.message || '导入失败')
      }
    } catch (e: any) {
      message.error('导入失败: ' + (e.message || '未知错误'))
    } finally {
      setUploading(false)
    }
  }

  const batchColumns = [
    { title: '文件名', dataIndex: 'file_name', key: 'file_name' },
    { title: '记录数', dataIndex: 'record_count', key: 'record_count' },
    { title: '加班记录', dataIndex: 'overtime_count', key: 'overtime_count' },
    {
      title: '数据范围',
      key: 'range',
      render: (_: any, r: ImportBatch) =>
        r.date_range_start ? `${r.date_range_start} ~ ${r.date_range_end}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          completed: 'green', processing: 'blue', pending: 'default', failed: 'red',
        }
        const labelMap: Record<string, string> = {
          completed: '已完成', processing: '处理中', pending: '待处理', failed: '失败',
        }
        return <Tag color={colorMap[s] || 'default'}>{labelMap[s] || s}</Tag>
      },
    },
    { title: '导入时间', dataIndex: 'imported_at', key: 'imported_at', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
  ]

  return (
    <div className="space-y-6">
      <Card title="导入考勤Excel">
        <Dragger
          accept=".xlsx,.xls"
          customRequest={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 .xlsx / .xls 格式的公司考勤日报文件
          </p>
        </Dragger>
        {uploading && <div className="mt-4 text-center text-blue-500">导入中，请稍候...</div>}
      </Card>

      {result && (
        <Card title="导入结果">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{result.record_count}</div>
              <div className="text-gray-500 text-sm">考勤记录</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{result.overtime_count}</div>
              <div className="text-gray-500 text-sm">加班记录</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-600">{result.skipped_count}</div>
              <div className="text-gray-500 text-sm">跳过行数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">{result.file_name}</div>
              <div className="text-gray-500 text-sm">文件名</div>
            </div>
          </div>
          {result.warnings.length > 0 && (
            <div className="mt-4">
              <div className="font-medium text-orange-600 mb-2">警告信息：</div>
              <ul className="list-disc pl-6 text-sm text-gray-600">
                {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card title="导入历史">
        <Table
          dataSource={batches}
          columns={batchColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
