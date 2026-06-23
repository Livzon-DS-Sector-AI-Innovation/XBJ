'use client'

import { useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Radio, Select, Space, Table, Tag, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import {
  fetchTrainingSpecialists,
  upsertTrainingSpecialist,
  deleteTrainingSpecialist,
  fetchDepartments,
  fetchNewDepartments,
  fetchEmployees,
  fetchNewEmployees,
  type TrainingSpecialist,
} from '@/lib/api/hr'

export default function TrainingSpecialistsClient() {
  const [data, setData] = useState<TrainingSpecialist[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TrainingSpecialist | null>(null)
  const [form] = Form.useForm()
  const [factory, setFactory] = useState<'old' | 'new'>('old')
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: string; label: string; number: string }[]>([])
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchTrainingSpecialists()
      setData(res.data || [])
    } catch (err: any) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async (f: 'old' | 'new') => {
    const fn = f === 'new' ? fetchNewDepartments : fetchDepartments
    try {
      const res = await fn({ page_size: 200 })
      const list = (res.data || []).map((d: any) => ({ value: d.name, label: d.name }))
      setDepartments(list)
    } catch { /* ignore */ }
  }

  const loadEmployees = async (dept: string) => {
    if (!dept) { setEmployees([]); return }
    const fn = factory === 'new' ? fetchNewEmployees : fetchEmployees
    try {
      const res = await fn({ department: dept, page_size: 200 })
      const list = (res.data || []).map((e: any) => ({
        value: e.name,
        label: `${e.name} (${e.employee_number})`,
        number: e.employee_number,
      }))
      setEmployees(list)
    } catch { /* ignore */ }
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadDepartments(factory) }, [factory])

  const handleAdd = () => {
    setEditingRecord(null)
    setFactory('old')
    form.resetFields()
    form.setFieldsValue({ factory: 'old' })
    setEmployees([])
    setModalOpen(true)
  }

  const handleEdit = (record: TrainingSpecialist) => {
    setEditingRecord(record)
    const f = (record.factory as 'old' | 'new') || 'old'
    setFactory(f)
    form.setFieldsValue({
      factory: f,
      department: record.department,
      employee_name: record.employee_name,
      employee_number: record.employee_number,
    })
    setEmployees([{ value: record.employee_name, label: `${record.employee_name} (${record.employee_number})`, number: record.employee_number }])
    setModalOpen(true)
    // 加载该部门的所有员工
    loadEmployeesForEdit(record.department, f)
  }

  const loadEmployeesForEdit = async (dept: string, f: 'old' | 'new') => {
    const fn = f === 'new' ? fetchNewEmployees : fetchEmployees
    try {
      const res = await fn({ department: dept, page_size: 200 })
      const list = (res.data || []).map((e: any) => ({
        value: e.name,
        label: `${e.name} (${e.employee_number})`,
        number: e.employee_number,
      }))
      setEmployees(list)
    } catch { /* ignore */ }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTrainingSpecialist(id)
      message.success('已删除')
      loadData()
    } catch (err: any) {
      message.error(err.message || '删除失败')
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await upsertTrainingSpecialist({
        department: values.department,
        employee_number: values.employee_number,
        employee_name: values.employee_name,
        factory: values.factory,
      })
      message.success('已保存')
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      message.error(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleFactoryChange = (f: 'old' | 'new') => {
    setFactory(f)
    setEmployees([])
    form.setFieldsValue({ department: undefined, employee_name: undefined, employee_number: undefined })
  }

  const columns = [
    { title: '厂区', dataIndex: 'factory', width: 80, render: (v: string) => v === 'new' ? <Tag color="blue">新厂</Tag> : <Tag>旧厂</Tag> },
    { title: '部门', dataIndex: 'department', width: 200 },
    { title: '培训专员', dataIndex: 'employee_name', width: 120 },
    { title: '工号', dataIndex: 'employee_number', width: 120 },
    {
      title: '操作', width: 120,
      render: (_: any, record: TrainingSpecialist) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">培训专员列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增培训专员</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />

      <Modal title={editingRecord ? '编辑培训专员' : '新增培训专员'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving} destroyOnClose>
        <Form form={form} layout="vertical" className="mt-4" initialValues={{ factory: 'old' }}>
          <Form.Item label="厂区" name="factory" rules={[{ required: true }]}>
            <Radio.Group onChange={(e) => handleFactoryChange(e.target.value)} optionType="button"
              options={[{ label: '旧厂', value: 'old' }, { label: '新厂', value: 'new' }]}
              disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item label="部门" name="department" rules={[{ required: true, message: '请选择部门' }]}>
            <Select showSearch placeholder="选择部门" options={departments}
              onChange={(dept: string) => { form.setFieldsValue({ employee_name: undefined, employee_number: undefined }); loadEmployees(dept) }} />
          </Form.Item>
          <Form.Item label="培训专员" name="employee_name" rules={[{ required: true, message: '请选择人员' }]}>
            <Select showSearch placeholder="先选部门，再选人员" options={employees} filterOption={(input, option) => (option?.label ?? '').includes(input)}
              notFoundContent={employees.length === 0 ? '请先选择部门' : '无匹配人员'}
              onChange={(name: string) => {
                const emp = employees.find(e => e.value === name)
                if (emp) form.setFieldsValue({ employee_number: emp.number })
              }} />
          </Form.Item>
          <Form.Item name="employee_number" hidden><Input /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
