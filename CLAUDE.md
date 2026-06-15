# LivzonAI 项目结构总览

> 本文件由 AI 自动生成，用于在新会话中快速加载项目结构，避免重复扫描目录树。
> 如需更新结构，运行：
> ```bash
> # 后端源文件
> find dazah-backend/app -type f | grep -v __pycache__ | sort
> # 前端源文件
> find dazah-frontend/src -type f | sort
> ```

## 项目概览

LivzonAI 是原料药事业部的工厂数字化基座，采用前后端分离的模块化单体架构。

- **后端**：`dazah-backend/` — Python 3.12 + FastAPI + SQLAlchemy 2.0 async + PostgreSQL + Redis + Alembic
- **前端**：`dazah-frontend/` — Next.js 16 + React 19 + TypeScript + Tailwind CSS + Ant Design V6

## 目录布局

```
d--LivzonAI/
├── dazah-backend/          # FastAPI 后端
│   ├── app/
│   │   ├── api/            # 全局路由装配
│   │   ├── core/           # 基础设施（配置、数据库、Redis、安全、异常、响应、事件）
│   │   ├── modules/        # 业务模块（每个模块独立：api / models / schemas / service / repository）
│   │   ├── platform/       # 平台能力（审计、身份、AI、系统集成）
│   │   ├── shared/         # 跨模块共享契约（ORM 基类、模块注册表、通用 schema）
│   │   └── main.py         # 应用入口
│   ├── alembic/            # 数据库迁移脚本
│   ├── scripts/            # 数据检查、飞书 bitable 同步、seed 脚本
│   ├── pyproject.toml
│   └── uv.lock
│
├── dazah-frontend/         # Next.js 前端
│   ├── src/
│   │   ├── app/            # App Router
│   │   │   ├── (dashboard)/       # 仪表盘路由组
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── admin/
│   │   │   │   ├── energy/
│   │   │   │   ├── equipment/
│   │   │   │   │   ├── assets/
│   │   │   │   │   ├── maintenance/
│   │   │   │   ├── hr/
│   │   │   │   │   ├── attendance/
│   │   │   │   │   ├── departments/
│   │   │   │   │   ├── offboarding/
│   │   │   │   │   ├── onboarding/
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── roster/
│   │   │   │   │   └── training/
│   │   │   │   ├── production/
│   │   │   │   │   └── products/
│   │   │   │   ├── purchasing/
│   │   │   │   ├── quality/
│   │   │   │   ├── rd/
│   │   │   │   ├── registration/
│   │   │   │   ├── safety/
│   │   │   │   └── warehouse/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/     # UI 组件（按模块分目录）
│   │   ├── actions/        # Server Actions（按模块分文件）
│   │   ├── stores/         # Zustand 客户端状态（按模块分文件）
│   │   ├── types/          # TypeScript 类型（按模块分文件）
│   │   └── lib/            # 基础设施（API 客户端、主题、菜单配置、dayjs 配置）
│   ├── public/
│   ├── next.config.mjs
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── .claude/                # Claude Code 本地配置
├── README.md
└── CLAUDE.md               # 本文件
```

---

## dazah-backend 详细结构

### 全局路由与入口

| 文件 | 职责 |
|------|------|
| `app/main.py` | FastAPI 应用实例创建、中间件挂载、生命周期事件 |
| `app/api/router.py` | 全局 API 路由装配入口，汇总各模块路由 |
| `app/api/v1/api.py` | v1 版本路由聚合 |

### 基础设施 (`app/core/`)

| 文件 | 职责 |
|------|------|
| `config.py` | Pydantic Settings 全局配置（数据库、Redis、飞书等） |
| `database.py` | SQLAlchemy async engine + async sessionmaker |
| `deps.py` | 通用依赖注入（DB session、Redis 等） |
| `events.py` | 应用生命周期事件（启动/关闭） |
| `exceptions.py` | 业务异常基类及 HTTP 异常处理器 |
| `response.py` | 统一响应封装 |
| `redis.py` | Redis 连接池 |
| `security.py` | 密码哈希、JWT、权限相关 |

### 共享契约 (`app/shared/`)

| 文件 | 职责 |
|------|------|
| `base_model.py` | SQLAlchemy ORM 基类 `BaseModel` |
| `module_registry.py` | 模块注册表（schema、路由、元数据） |
| `module_api.py` | 模块级 API 工具/基类 |
| `schemas.py` | 跨模块通用 Pydantic schema |

### 平台能力 (`app/platform/`)

| 目录/文件 | 职责 |
|-----------|------|
| `audit/` | 审计日志：middleware、models、service |
| `identity/` | 本地轻量用户档案、依赖注入获取当前用户 |
| `ai/` | AI 对话/助手能力：api、deps、schemas、service |
| `system/` | 系统级 API |
| `integrations/` | 外部系统集成 |
| `integrations/base.py` | 集成抽象基类 |
| `integrations/feishu/` | 飞书集成：auth、bitable、client、datasource、employee_datasource |
| `integrations/erp/` | ERP 集成（占位） |
| `integrations/lims/` | LIMS 集成（占位） |

### 业务模块 (`app/modules/`)

每个模块通常包含：
- `api.py` — 路由
- `models.py` — ORM 模型
- `schemas.py` — Pydantic schema
- `service.py` — 业务逻辑
- `repository.py` — 数据访问
- `public_api.py` — 跨模块暴露的公共接口（可选）

> `equipment` 模块结构较深，拆分为 `api/`、`models/`、`schemas/`、`repository/`、`service/` 子目录。

| 模块 | 路径 | 说明 |
|------|------|------|
| 行政 | `app/modules/administration/` | |
| 能源 | `app/modules/energy/` | |
| 环保 | `app/modules/environment/` | |
| 设备 | `app/modules/equipment/` | 含 calibration、equipment、failure_codes、work_orders 子领域 |
| 人事 | `app/modules/hr/` | |
| 采购 | `app/modules/procurement/` | |
| 产品 | `app/modules/product/` | |
| 生产 | `app/modules/production/` | |
| 质量 | `app/modules/quality/` | |
| 注册 | `app/modules/registration/` | |
| 研发 | `app/modules/research/` | |
| 安全 | `app/modules/safety/` | |
| 仓储 | `app/modules/warehouse/` | |

---

## dazah-frontend 详细结构

### 路由页面 (`src/app/(dashboard)/`)

| 页面路径 | 说明 |
|----------|------|
| `admin/page.tsx` | 行政 |
| `energy/page.tsx` | 能源 |
| `equipment/page.tsx` | 设备总览 |
| `equipment/assets/page.tsx` | 设备资产 |
| `equipment/maintenance/page.tsx` | 设备维护 |
| `hr/page.tsx` | 人事总览 |
| `hr/attendance/page.tsx` | 考勤 |
| `hr/departments/page.tsx` | 部门管理 |
| `hr/offboarding/page.tsx` | 离职管理 |
| `hr/onboarding/page.tsx` | 入职管理 |
| `hr/profile/page.tsx` | 员工档案 |
| `hr/roster/page.tsx` | 花名册 |
| `hr/training/page.tsx` | 培训 |
| `production/page.tsx` | 生产 |
| `production/products/page.tsx` | 产品管理 |
| `purchasing/page.tsx` | 采购 |
| `quality/page.tsx` | 质量 |
| `rd/page.tsx` | 研发 |
| `registration/page.tsx` | 注册 |
| `safety/page.tsx` | 安全 |
| `warehouse/page.tsx` | 仓储 |

### 组件 (`src/components/`)

按模块分目录，每个模块目录下有具体组件，通过 `index.ts` 统一导出。

公共布局组件：
- `layout/AppShell.tsx`
- `layout/Sidebar.tsx`
- `layout/TopNav.tsx`
- `AntdProvider.tsx`
- `icons.tsx`

### Actions (`src/actions/`)

| 文件 | 模块 |
|------|------|
| `admin.ts` | 行政 |
| `energy.ts` | 能源 |
| `equipment.ts` | 设备 |
| `hr.ts` | 人事 |
| `product.ts` | 产品 |
| `production.ts` | 生产 |
| `purchasing.ts` | 采购 |
| `quality.ts` | 质量 |
| `rd.ts` | 研发 |
| `registration.ts` | 注册 |
| `safety.ts` | 安全 |
| `warehouse.ts` | 仓储 |

### API 客户端 (`src/lib/api/`)

| 文件 | 说明 |
|------|------|
| `index.ts` | API 基础配置/统一导出 |
| `ai.ts` | AI 接口 |
| `equipment.ts` | 设备服务端 fetch |
| `equipment-client.ts` | 设备客户端 fetch |
| `hr.ts` | 人事接口 |
| `product.ts` | 产品接口 |

### 状态管理 (`src/stores/`)

与 actions 一一对应的 Zustand store 文件。

### 类型定义 (`src/types/`)

与 actions 一一对应的 TypeScript 类型文件，外加 `index.ts` 统一导出。

---

## 数据库与迁移

- ORM：SQLAlchemy 2.0 async (`Mapped[...]` + `mapped_column`)
- 迁移：Alembic，迁移文件位于 `dazah-backend/alembic/versions/`
- Schema 隔离：每个业务模块独立 PostgreSQL schema（如 `production`、`equipment`、`hr`、`audit`、`identity`）
- 新增模块时同步更新 `app/shared/module_registry.py`

---

## 关键配置文件

| 文件 | 说明 |
|------|------|
| `dazah-backend/pyproject.toml` | Python 项目配置、依赖、工具（ruff、mypy、pytest） |
| `dazah-backend/alembic.ini` | Alembic 配置 |
| `dazah-backend/.env` / `.env.example` | 后端环境变量 |
| `dazah-frontend/package.json` | 前端依赖与脚本 |
| `dazah-frontend/next.config.mjs` | Next.js 配置 |
| `dazah-frontend/.env.local` / `.env.example` | 前端环境变量（含 `API_BASE_URL`） |
| `dazah-frontend/postcss.config.mjs` | PostCSS 配置 |
| `dazah-frontend/pnpm-workspace.yaml` | pnpm workspace |
| `.claudeignore` | Claude Code 忽略规则 |
| `.claude/settings.local.json` | Claude Code 本地权限与设置 |

---

## 各包独立规范

- 后端编程规范：`dazah-backend/CLAUDE.md`
- 前端编程规范：`dazah-frontend/CLAUDE.md`
