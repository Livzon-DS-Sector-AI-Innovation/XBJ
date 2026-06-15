'use client'

import { useState, useCallback, useEffect } from 'react'
import { Table, Input, message, Button, Space, Modal, Form } from 'antd'
import { SearchOutlined, SyncOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { MaterialBom } from '@/types/production'
import { fetchMaterialBoms, syncMaterialBomsFromFeishu } from '@/lib/api/production'
import { createMaterialBom, updateMaterialBom } from '@/actions/production'

interface MaterialBomClientProps {
  initialBoms: MaterialBom[]
  initialTotal: number
}

export default function MaterialBomClient({ initialBoms, initialTotal }: MaterialBomClientProps) {
  const [boms, setBoms] = useState<MaterialBom[]>(initialBoms)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBom, setEditingBom] = useState<MaterialBom | null>(null)
  const [form] = Form.useForm()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchMaterialBoms({
        keyword: keyword || undefined,
        page,
        page_size: pageSize,
      })
      setBoms(res.data)
      setTotal(res.meta?.total || 0)
    } catch (err: any) {
      message.error(err.message || '加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page, pageSize, loadData])

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

  const handleSyncFromFeishu = async () => {
    setSyncing(true)
    try {
      const res = await syncMaterialBomsFromFeishu()
      message.success(res.message)
      loadData()
    } catch (err: any) {
      message.error(err.message || '同步失败')
    } finally {
      setSyncing(false)
    }
  }

  const openCreateModal = () => {
    setEditingBom(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (bom: MaterialBom) => {
    setEditingBom(bom)
    form.setFieldsValue({
      name: bom.name,
      code: bom.code,
      manufacturer: bom.manufacturer,
      material_level: bom.material_level,
      document_name: bom.document_name,
      quality_standard: bom.quality_standard,
      process_name: bom.process_name,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (editingBom) {
        await updateMaterialBom(editingBom.id, values)
        message.success('修改成功')
      } else {
        await createMaterialBom(values)
        message.success('新增成功')
      }
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      if (err.errorFields) return
      message.error(err.message || '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: '物料名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left' as const,
    },
    {
      title: '物料代号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '生产商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 160,
    },
    {
      title: '物料级别',
      dataIndex: 'material_level',
      key: 'material_level',
      width: 120,
    },
    {
      title: '文件名称',
      dataIndex: 'document_name',
      key: 'document_name',
      width: 200,
    },
    {
      title: '质量标准',
      dataIndex: 'quality_standard',
      key: 'quality_standard',
      width: 180,
    },
    {
      title: '工艺名称',
      dataIndex: 'process_name',
      key: 'process_name',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: MaterialBom) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
          修改
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-[var(--color-charcoal)]">
          物料清单
        </h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新增物料
          </Button>
          <Button
            icon={<SyncOutlined spin={syncing} />}
            loading={syncing}
            onClick={handleSyncFromFeishu}
          >
            从飞书同步
          </Button>
        </Space>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="搜索物料名称、代号、生产商或工艺名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<SearchOutlined />}
          className="w-80"
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={boms}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
        scroll={{ x: 1300 }}
        size="small"
        bordered
      />

      <Modal
        title={editingBom ? '修改物料' : '新增物料'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="物料名称"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="code" label="物料代号">
            <Input placeholder="请输入物料代号" />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产商">
            <Input placeholder="请输入生产商" />
          </Form.Item>
          <Form.Item name="material_level" label="物料级别">
            <Input placeholder="请输入物料级别" />
          </Form.Item>
          <Form.Item name="document_name" label="文件名称">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item name="quality_standard" label="质量标准">
            <Input placeholder="请输入质量标准" />
          </Form.Item>
          <Form.Item name="process_name" label="工艺名称">
            <Input placeholder="请输入工艺名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
