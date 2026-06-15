'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Input, Tag, Space, Modal, Form, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api/admin/vehicle'

const STATUS_COLORS: Record<string, string> = {
  '可用': 'success',
  '维修中': 'warning',
  '已报废': 'error',
}

export default function VehiclePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetchVehicles({ keyword, page, page_size: pagination.pageSize })
      setData(res.data?.data || [])
      setPagination({ ...pagination, current: page, total: res.data?.meta?.total || 0 })
    } catch (err: any) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [keyword])

  const handleSave = async (values: any) => {
    try {
      if (editing) {
        await updateVehicle(editing.id, values)
        message.success('更新成功')
      } else {
        await createVehicle(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditing(null)
      load(pagination.current)
    } catch (err: any) {
      message.error(err.message || '保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(id)
      message.success('删除成功')
      load(pagination.current)
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const columns = [
    { title: '车牌号', dataIndex: 'plate_number', key: 'plate_number' },
    { title: '品牌', dataIndex: 'brand', key: 'brand' },
    { title: '型号', dataIndex: 'model', key: 'model' },
    { title: '颜色', dataIndex: 'color', key: 'color' },
    { title: '里程', dataIndex: 'mileage', key: 'mileage' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>,
    },
    { title: '所属部门', dataIndex: 'owner_department', key: 'owner_department' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditing(record)
              form.setFieldsValue(record)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">车辆信息</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="搜索车牌号或品牌"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => load(1)}
          style={{ width: 280 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          新增车辆
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => load(page),
        }}
      />
      <Modal
        open={modalOpen}
        title={editing ? '编辑车辆' : '新增车辆'}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields() }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="plate_number" label="车牌号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="brand" label="品牌">
            <Input />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input />
          </Form.Item>
          <Form.Item name="mileage" label="里程">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="可用">
            <Input />
          </Form.Item>
          <Form.Item name="owner_department" label="所属部门">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
