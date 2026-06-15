export interface SubMenuItem {
  key: string
  label: string
  path: string
  children?: SubMenuItem[]
}

export interface ModuleMenu {
  key: string
  label: string
  icon: string
  path: string
  children: SubMenuItem[]
}

export const moduleMenus: ModuleMenu[] = [
  {
    key: "production",
    label: "生产管理",
    icon: "factory",
    path: "/production",
    children: [
      { key: "batches", label: "批次管理", path: "/production/batches" },
      { key: "plan", label: "生产计划", path: "/production/plan" },
      { key: "process", label: "工艺规程", path: "/production/process" },
      { key: "records", label: "生产记录", path: "/production/records" },
      { key: "balance", label: "物料平衡", path: "/production/balance" },
    ],
  },
  {
    key: "equipment",
    label: "设备管理",
    icon: "cog",
    path: "/equipment",
    children: [
      { key: "assets", label: "设备台账", path: "/equipment/assets" },
      { key: "maintenance", label: "维护保养", path: "/equipment/maintenance" },
      { key: "inspection", label: "设备巡检", path: "/equipment/inspection" },
      { key: "spare-parts", label: "备件管理", path: "/equipment/spare-parts" },
    ],
  },
  {
    key: "energy",
    label: "能源管理",
    icon: "bolt",
    path: "/energy",
    children: [
      { key: "monitor", label: "能耗监控", path: "/energy/monitor" },
      { key: "report", label: "能源报表", path: "/energy/report" },
      { key: "saving", label: "节能措施", path: "/energy/saving" },
    ],
  },
  {
    key: "safety",
    label: "安全管理",
    icon: "shield",
    path: "/safety",
    children: [
      { key: "check", label: "安全检查", path: "/safety/check" },
      { key: "hazard", label: "隐患排查", path: "/safety/hazard" },
      { key: "accident", label: "事故管理", path: "/safety/accident" },
      { key: "training", label: "安全培训", path: "/safety/training" },
    ],
  },
  {
    key: "rd",
    label: "研发管理",
    icon: "beaker",
    path: "/rd",
    children: [
      { key: "projects", label: "研发项目", path: "/rd/projects" },
      { key: "experiments", label: "实验记录", path: "/rd/experiments" },
      { key: "reports", label: "研发报告", path: "/rd/reports" },
    ],
  },
  {
    key: "registration",
    label: "注册管理",
    icon: "document",
    path: "/registration",
    children: [
      { key: "filing", label: "注册申报", path: "/registration/filing" },
      { key: "regulation", label: "法规跟踪", path: "/registration/regulation" },
      { key: "documents", label: "文件管理", path: "/registration/documents" },
    ],
  },
  {
    key: "quality",
    label: "质量管理",
    icon: "check-circle",
    path: "/quality",
    children: [
      { key: "inspection", label: "质量检验", path: "/quality/inspection" },
      { key: "deviation", label: "偏差管理", path: "/quality/deviation" },
      { key: "capa", label: "CAPA管理", path: "/quality/capa" },
      { key: "change", label: "变更控制", path: "/quality/change" },
    ],
  },
  {
    key: "admin",
    label: "行政管理",
    icon: "building",
    path: "/admin",
    children: [
      { key: "notice", label: "企业规章制度", path: "/admin/notice" },
      { key: "approval", label: "寄件申请", path: "/admin/approval" },
      {
        key: "meeting",
        label: "物品领用",
        path: "/admin/meeting",
        children: [
          { key: "meeting-ledger", label: "物品台账", path: "/admin/meeting/ledger" },
          { key: "meeting-requisitions", label: "领用记录", path: "/admin/meeting/requisitions" },
          { key: "meeting-requests", label: "领用申请", path: "/admin/meeting/requests" },
        ],
      },
      {
        key: "vehicle",
        label: "车队管理",
        path: "/admin/vehicles",
        children: [
          { key: "vehicles", label: "车辆信息", path: "/admin/vehicles" },
          { key: "vehicle-requests", label: "用车申请", path: "/admin/vehicle-requests" },
        ],
      },
      {
        key: "it",
        label: "IT管理",
        path: "/admin/it-tickets",
        children: [
          { key: "it-tickets", label: "IT服务工单", path: "/admin/it-tickets" },
        ],
      },
    ],
  },
  {
    key: "hr",
    label: "人事管理",
    icon: "users",
    path: "/hr",
    children: [
      { key: "departments", label: "部门管理", path: "/hr/departments" },
      { key: "profile", label: "员工档案", path: "/hr/profile" },
      { key: "roster", label: "员工花名册", path: "/hr/roster" },
      { key: "onboarding", label: "老厂入职台账", path: "/hr/onboarding" },
      { key: "departure", label: "老厂离职台账", path: "/hr/departure" },
      { key: "offboarding", label: "离职管理", path: "/hr/offboarding" },
      { key: "recruitment", label: "招聘管理", path: "/hr/recruitment" },
      { key: "training", label: "培训管理", path: "/hr/training" },
    ],
  },
  {
    key: "warehouse",
    label: "仓储管理",
    icon: "archive",
    path: "/warehouse",
    children: [
      { key: "inventory", label: "库存管理", path: "/warehouse/inventory" },
      { key: "inout", label: "出入库记录", path: "/warehouse/inout" },
      { key: "stocktake", label: "库存盘点", path: "/warehouse/stocktake" },
    ],
  },
  {
    key: "purchasing",
    label: "采购管理",
    icon: "cart",
    path: "/purchasing",
    children: [
      { key: "request", label: "采购申请", path: "/purchasing/request" },
      { key: "supplier", label: "供应商管理", path: "/purchasing/supplier" },
      { key: "order", label: "采购订单", path: "/purchasing/order" },
    ],
  },
]

export function getModuleByKey(key: string): ModuleMenu | undefined {
  return moduleMenus.find((m) => m.key === key)
}
