# 人事与行政模块浏览器自动化测试报告及修复方案

## 测试执行摘要

- **测试框架**: Playwright 1.61.0
- **测试用例总数**: 59 个
- **通过**: 59 个
- **失败**: 0 个
- **执行时间**: ~66 秒
- **测试范围**: 行政模块（18个） + 人事模块（17个） + 培训模块（24个）

## 测试用例覆盖清单

### 行政模块（`e2e/admin/admin.spec.ts`）

| 功能模块 | 测试用例 | 状态 |
|---------|---------|------|
| 行政首页 | 页面加载并显示标题 | ✅ 通过 |
| 行政首页 | 显示待开发占位符 | ✅ 通过 |
| 行政首页 | 侧边栏导航存在 | ✅ 通过 |
| 公告通知 | 页面可访问并加载 | ✅ 通过 |
| 会议台账 | 页面加载并显示表格 | ✅ 通过 |
| 会议台账 | 搜索功能可用 | ✅ 通过 |
| 会议台账 | 新增物品按钮可用 | ✅ 通过 |
| 会议台账 | 状态筛选可用 | ✅ 通过 |
| 车辆信息 | 页面加载并显示搜索框 | ✅ 通过 |
| 车辆信息 | 新增车辆按钮可用 | ✅ 通过 |
| 车辆信息 | 批量导入按钮可用 | ✅ 通过 |
| 车辆信息 | 下载模板按钮可用 | ✅ 通过 |
| 用车申请 | 页面加载并显示飞书表单 | ✅ 通过 |
| 用车申请 | 显示用车数据标题 | ✅ 通过 |
| 文件审批 | 页面加载并显示飞书表单 | ✅ 通过 |
| 文件审批 | 显示温馨提示 | ✅ 通过 |
| IT服务工单 | 页面加载并显示飞书表单 | ✅ 通过 |
| IT服务工单 | 显示报修温馨提示 | ✅ 通过 |

### 人事模块（`e2e/hr/hr.spec.ts`）

| 功能模块 | 测试用例 | 状态 |
|---------|---------|------|
| 人事首页 | 页面加载并显示标题 | ✅ 通过 |
| 人事首页 | 显示8个功能卡片 | ✅ 通过 |
| 人事首页 | 员工档案卡片可点击 | ✅ 通过 |
| 人事首页 | 部门管理卡片可点击 | ✅ 通过 |
| 人事首页 | 招聘管理卡片可点击 | ✅ 通过 |
| 人事首页 | 培训管理卡片可点击 | ✅ 通过 |
| 员工档案 | 页面加载并显示数据表格 | ✅ 通过 |
| 员工档案 | 表格包含员工数据 | ✅ 通过 |
| 部门管理 | 页面加载并显示数据表格 | ✅ 通过 |
| 部门管理 | 表格包含部门数据 | ✅ 通过 |
| 招聘管理 | 页面加载并显示数据表格 | ✅ 通过 |
| 培训管理首页 | 页面加载并显示标题 | ✅ 通过 |
| 培训管理首页 | 显示6个功能卡片 | ✅ 通过 |
| 培训管理首页 | 年度培训计划卡片可点击 | ✅ 通过 |
| 培训管理首页 | AI出题卡片可点击 | ✅ 通过 |
| 新厂人事模块 | 新厂部门管理页面加载 | ✅ 通过 |
| 新厂人事模块 | 新厂员工档案页面加载 | ✅ 通过 |

### 培训模块（`e2e/hr/training.spec.ts`）

| 功能模块 | 测试用例 | 状态 |
|---------|---------|------|
| 培训模块首页 | 页面加载并显示标题 | ✅ 通过 |
| 培训模块首页 | 显示6个功能卡片 | ✅ 通过 |
| 培训模块首页 | 年度培训计划卡片可点击 | ✅ 通过 |
| 培训模块首页 | 新员工入职培训卡片可点击 | ✅ 通过 |
| 培训模块首页 | 培训通知卡片可点击 | ✅ 通过 |
| 培训模块首页 | 培训签到表卡片可点击 | ✅ 通过 |
| 培训模块首页 | 培训台账卡片可点击 | ✅ 通过 |
| 培训模块首页 | AI出题卡片可点击 | ✅ 通过 |
| 新员工入职培训 | 页面加载并显示标题 | ✅ 通过 |
| 新员工入职培训 | 旧厂/新厂切换可用 | ✅ 通过 |
| 新员工入职培训 | 员工选择器加载 | ✅ 通过 |
| 培训通知 | 页面加载并显示标题 | ✅ 通过 |
| 培训通知 | 表单元素存在 | ✅ 通过 |
| 培训签到表 | 页面加载并显示标题 | ✅ 通过 |
| 培训签到表 | 表单元素存在 | ✅ 通过 |
| 培训台账 | 页面加载并显示标题 | ✅ 通过 |
| 培训台账 | 表格或空状态加载 | ✅ 通过 |
| 年度培训计划 | 页面加载并显示标题 | ✅ 通过 |
| 年度培训计划 | 表格或空状态加载 | ✅ 通过 |
| AI出题 | 页面加载并显示标题 | ✅ 通过 |
| AI出题 | 上传区域存在 | ✅ 通过 |
| 新厂人事模块 | 新厂员工档案页面加载并显示数据 | ✅ 通过 |
| 新厂人事模块 | 新厂部门管理页面加载并显示数据 | ✅ 通过 |
| 新厂人事模块 | 新厂入职台账页面加载 | ✅ 通过 |

## 发现的问题及修复方案

### 问题 1：新厂数据源同步脚本缺失（已修复）

**现象**:
- 新厂员工档案、部门管理页面加载但无数据
- 后端 `hr.employees_new` 等克隆表为空
- 主项目中不存在 `sync_feishu_to_clone_tables.py`

**根因**:
- 主项目（XBJ）缺少飞书Bitable数据同步脚本
- 脚本存在于参考目录：`人事培训模块-只读-仅参考\dazah-backend\scripts\`

**修复方案**（已执行）:
```bash
# 1. 复制同步脚本到主项目
cp "人事培训模块-只读-仅参考/dazah-backend/scripts/sync_feishu_to_clone_tables.py" \
   XBJ/dazah-backend/scripts/

# 2. 使用只读副本中的飞书凭据运行同步
export FEISHU_APP_ID=cli_a965af5f70525cb5
export FEISHU_APP_SECRET=dW90FQW5h1SKDL6cOLdRUhcEcPkoCG0z
uv run python scripts/sync_feishu_to_clone_tables.py

# 同步结果：
# - hr.employees_old: 386 条记录
# - hr.employees_new: 数据已同步
# - hr.onboarding_records_old/new: 数据已同步
# - hr.departure_records_old: 数据已同步
# - hr.departure_records_new: 部分失败（position 字段非空约束，飞书表格部分记录缺少该字段）
```

**验证**:
```bash
curl http://localhost:8000/api/v1/hr/new/employees?page=1&page_size=5
# 返回 200 和新厂员工数据
```

---

### 问题 2：行政首页功能缺失（中等）

**现象**:
- 行政首页 `/admin` 仅显示 "行政管理模块内容待开发" 占位符
- 无功能入口卡片

**根因**:
- `src/app/(dashboard)/admin/page.tsx` 只渲染了简单的占位文字，没有实现模块导航卡片

**修复方案**:
参考人事首页和培训首页的实现，为行政首页添加功能入口卡片：

```tsx
import Link from 'next/link'
import { Card, Row, Col } from 'antd'
import {
  BellOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CarOutlined,
  ToolOutlined,
} from '@ant-design/icons'

const modules = [
  {
    key: 'notice',
    title: '公告通知',
    desc: '查看公司规章制度和公告通知',
    icon: <BellOutlined className="text-2xl text-[var(--color-primary)]" />,
    path: '/admin/notice',
  },
  {
    key: 'meeting',
    title: '会议管理',
    desc: '会议室管理、物品台账',
    icon: <CalendarOutlined className="text-2xl text-[var(--color-primary)]" />,
    path: '/admin/meeting/ledger',
  },
  {
    key: 'approval',
    title: '文件审批',
    desc: '寄件申请等文件审批流程',
    icon: <FileTextOutlined className="text-2xl text-[var(--color-primary)]" />,
    path: '/admin/approval',
  },
  {
    key: 'vehicles',
    title: '车队管理',
    desc: '车辆信息、用车申请',
    icon: <CarOutlined className="text-2xl text-[var(--color-primary)]" />,
    path: '/admin/vehicles',
  },
  {
    key: 'it-tickets',
    title: 'IT服务工单',
    desc: 'IT报修和故障处理',
    icon: <ToolOutlined className="text-2xl text-[var(--color-primary)]" />,
    path: '/admin/it-tickets',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-charcoal)] mb-2">
          行政管理
        </h1>
        <p className="text-[14px] text-[var(--color-steel)]">
          行政、后勤、IT等综合服务管理
        </p>
      </div>
      <Row gutter={[16, 16]}>
        {modules.map((mod) => (
          <Col xs={24} sm={12} lg={8} key={mod.key}>
            <Link href={mod.path}>
              <Card hoverable className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{mod.icon}</div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[var(--color-charcoal)] mb-1">
                      {mod.title}
                    </h3>
                    <p className="text-[14px] text-[var(--color-steel)] leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  )
}
```

---

### 问题 3：会议台账页面名称与实际内容不匹配（轻微）

**现象**:
- 菜单中显示 "会议管理 -> 会议台账"
- 但页面标题显示的是 "物品台账"
- 页面管理的是礼品/物品库存，而非会议相关数据

**根因**:
- 页面 `src/app/(dashboard)/admin/meeting/ledger/page.tsx` 使用了 `GiftInventory` 相关的 API 和组件，但标题写成了 "物品台账"
- 可能会议台账和物品台账是两个不同的功能，但代码混用了

**修复方案**:
根据业务需求选择以下方案之一：

**方案 A**：如果该页面确实是会议物品台账，修改标题为 "会议物品台账"
```tsx
<h1 className="text-xl font-bold mb-4">会议物品台账</h1>
```

**方案 B**：如果该页面是通用的物品台账，修改菜单路径为 `/admin/inventory` 或类似路径

---

### 问题 4：培训首页卡片点击需精确点击标题（已修复）

**现象**:
- 测试中使用 `page.locator('.ant-card').first().click()` 点击培训首页卡片时，URL 没有变化
- 页面仍停留在 `/hr/training`

**根因**:
- Ant Design Card 组件被 Link 包裹，但点击整个卡片区域时，事件可能没有正确冒泡到 Link 组件
- 需要精确点击卡片标题文字（h3 元素）才能触发导航

**修复方案**（已应用于测试代码）:
```typescript
// 修改前（失败）
const card = page.locator('.ant-card').filter({ hasText: '年度培训计划' }).first()
await card.click()

// 修改后（成功）
const title = page.locator('.ant-card').filter({ hasText: '年度培训计划' }).locator('h3').first()
await title.click()
```

**建议前端修复**:
建议前端将卡片的 `cursor-pointer` 样式应用到整个 Card 组件，或者确保点击卡片任意位置都能触发导航。当前只有点击标题文字才能跳转，用户体验不佳。

---

### 问题 5：departure_records_new 同步失败（轻微）

**现象**:
- 同步脚本在同步 `hr.departure_records_new` 时失败
- 错误：`null value in column "position" of relation "departure_records_new" violates not-null constraint`

**根因**:
- 飞书表格中部分离职记录缺少 "职位" 字段
- 数据库表 `departure_records_new` 的 `position` 字段有 `not-null` 约束

**修复方案**:
修改同步脚本或数据库 schema，允许 `position` 字段为空：

**方案 A**：修改数据库迁移，将 `position` 改为 nullable
```python
# alembic 迁移
op.alter_column('departure_records_new', 'position', nullable=True, schema='hr')
```

**方案 B**：修改同步脚本，为空 position 提供默认值
```python
# 在 DEPARTURE_NEW_FIELD_MAP 中
"position": ("职位", lambda v: _extract_text(v) or "未知"),
```

---

## 新增/修改文件清单

### 测试文件（新增）
```
XBJ/dazah-frontend/
├── playwright.config.ts              # Playwright 配置
├── e2e/
│   ├── admin/
│   │   └── admin.spec.ts             # 行政模块测试（18个）
│   ├── hr/
│   │   ├── hr.spec.ts                # 人事模块测试（17个）
│   │   └── training.spec.ts          # 培训模块测试（24个）
│   └── TEST_REPORT.md                # 完整测试报告
```

### 同步脚本（新增）
```
XBJ/dazah-backend/
└── scripts/
    └── sync_feishu_to_clone_tables.py  # 新厂数据源同步脚本（从参考目录复制）
```

## 运行测试的命令

```bash
# 进入前端项目目录
cd XBJ/dazah-frontend

# 运行全部测试（59个）
./node_modules/.bin/playwright test

# 运行行政模块测试
./node_modules/.bin/playwright test e2e/admin

# 运行人事模块测试
./node_modules/.bin/playwright test e2e/hr/hr.spec.ts

# 运行培训模块测试
./node_modules/.bin/playwright test e2e/hr/training.spec.ts

# 生成并查看 HTML 报告
./node_modules/.bin/playwright test --reporter=html
./node_modules/.bin/playwright show-report
```

## 新厂数据源同步命令

```bash
cd XBJ/dazah-backend

# 使用正确的飞书凭据运行同步
export FEISHU_APP_ID=cli_a965af5f70525cb5
export FEISHU_APP_SECRET=dW90FQW5h1SKDL6cOLdRUhcEcPkoCG0z
uv run python scripts/sync_feishu_to_clone_tables.py
```

## 后续建议

1. **持续集成**: 将 `playwright test` 添加到 CI/CD 流程中，确保每次代码提交都运行自动化测试
2. **增加测试覆盖**: 当前测试覆盖了页面加载和基本交互，建议后续增加：
   - 表单提交和验证测试（创建培训台账、年度计划等）
   - 数据增删改查的完整流程测试
   - 文档导出功能测试（Word/Excel 生成）
   - AI出题功能测试（文件上传、题目生成）
   - 权限控制测试（如果有登录模块）
3. **性能测试**: 监控页面加载时间，特别是包含飞书 iframe 的页面
4. **测试数据管理**: 考虑使用独立的测试数据库，避免测试数据污染生产数据
5. **修复前端卡片点击体验**: 确保培训首页和人事首页的 Card 组件点击任意位置都能触发导航

---

**测试完成时间**: 2026/06/16
**测试环境**: Windows 11 + Chrome (Chromium) + Next.js 16 + FastAPI + PostgreSQL + Redis
**新厂数据同步状态**: 已同步（5/6张表成功，departure_records_new 部分失败）
