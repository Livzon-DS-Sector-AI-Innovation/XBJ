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
      { key: "products", label: "产品信息", path: "/production/products" },
      { key: "material-bom", label: "物料清单", path: "/production/material-bom" },
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
      { key: "notice", label: "公告通知", path: "/admin/notice" },
      { key: "meeting", label: "会议管理", path: "/admin/meeting" },
      { key: "approval", label: "文件审批", path: "/admin/approval" },
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
      {
        key: "old-factory",
        label: "老厂",
        path: "/hr/departments",
        children: [
          { key: "departments", label: "部门管理", path: "/hr/departments" },
          { key: "profile", label: "员工档案", path: "/hr/profile" },
          { key: "roster", label: "员工花名册", path: "/hr/roster" },
          { key: "onboarding", label: "入职台账", path: "/hr/onboarding" },
          { key: "departure", label: "离职台账", path: "/hr/departure" },
          { key: "offboarding", label: "离职管理", path: "/hr/offboarding" },
          { key: "recruitment", label: "招聘管理", path: "/hr/recruitment" },
        ],
      },
      {
        key: "new-factory",
        label: "新厂",
        path: "#",
        children: [
          { key: "new-departments", label: "部门管理", path: "/hr/new/departments" },
          { key: "new-profile", label: "员工档案", path: "/hr/new/profile" },
          { key: "new-onboarding", label: "入职台账", path: "/hr/new/onboarding" },
          { key: "new-departure", label: "离职台账", path: "/hr/new/departure" },
          { key: "new-offboarding", label: "离职管理", path: "/hr/new/offboarding" },
        ],
      },
      {
        key: "new-training",
        label: "培训管理",
        path: "/hr/training",
        children: [
          { key: "new-onboarding-training", label: "新员工入职培训", path: "/hr/training/onboarding" },
          { key: "new-training-notification", label: "培训通知", path: "/hr/training/notification" },
          { key: "new-sign-in-sheet", label: "培训签到表", path: "/hr/training/sign-in" },
          { key: "new-ai-exam", label: "AI 出题", path: "/hr/training/ai-exam" },
          {
            key: "new-annual-plan",
            label: "年度培训计划",
            path: "/hr/training/annual-plan",
            children: [
              { key: "new-annual-plan-new", label: "新建年度培训计划", path: "/hr/training/annual-plan/new" },
            ],
          },
          {
            key: "new-training-ledger",
            label: "培训台账",
            path: "/hr/training/ledger",
            children: [
              { key: "new-training-ledger-new", label: "新建培训台账", path: "/hr/training/ledger/new" },
              {
                key: "new-training-ledger-dept-人事行政部",
                label: "人事行政部",
                path: "#",
                children: [
                  { key: "new-training-ledger-li-jianwen", label: "李健文培训台账", path: "/hr/training/ledger?employee_number=110000673" },
                  { key: "new-training-ledger-huang-liyun", label: "黄丽耘培训台账", path: "/hr/training/ledger?employee_number=110001372" },
                  { key: "new-training-ledger-li-wenzhao", label: "李文兆培训台账", path: "/hr/training/ledger?employee_number=10086" },
                ],
              },
            ],
          },
        ],
      },
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
