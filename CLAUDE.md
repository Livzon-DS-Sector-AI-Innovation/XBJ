# LivzonAI 项目级开发参考文档

本文档为 `dazah-backend/CLAUDE.md`（后端编程规范）和 `dazah-frontend/CLAUDE.md`（前端编程规范）的补充，聚焦**项目级数据源引用**与**飞书机器人配置**，为后续新模块开发提供集中参考。

---

## 1. 项目概览

LivzonAI 是原料药事业部工厂数字化基座，采用前后端分离的模块化单体架构：

- **后端**：`dazah-backend/` — Python 3.12 + FastAPI + SQLAlchemy 2.0 async + PostgreSQL + Redis
- **前端**：`dazah-frontend/` — Next.js 16 + React 19 + TypeScript + Ant Design V6

外部系统集成以**飞书（Lark）开放平台**为核心，覆盖 HR 台账、招聘、行政用车、培训通知等业务场景；AI 能力通过 Moonshot（Kimi）API 提供。

---

## 2. 数据源引用指南

### 2.1 主数据库（PostgreSQL）

- **连接方式**：`postgresql+asyncpg://`（SQLAlchemy 2.0 异步引擎）
- **环境变量**：`DATABASE_URL`（本地开发） / `APP_DATABASE_URL`（Docker 环境）
- **引擎定义**：`dazah-backend/app/core/database.py`
- **会话获取**：`async def get_db() -> AsyncGenerator[AsyncSession]`
- **ORM 基类**：`dazah-backend/app/shared/base_model.py`（`BaseModel`）
- **Schema 隔离**：每个业务模块独立 PostgreSQL schema，由 `app/shared/module_registry.py` 的 `BUSINESS_SCHEMAS` 维护
- **连接池**：默认 `pool_size=10`，`max_overflow=20`，启用 `pool_pre_ping=True`
- **搜索路径**：`public,identity,<business_schemas...>`

**典型用法（模块内）**：

```python
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from app.core.database import get_db

async def create_item(data: ItemCreate, db: AsyncSession = Depends(get_db)):
    ...
```

**注意事项**：
- 业务模型必须继承 `BaseModel`，并在 `__table_args__` 中声明 `"schema": "<module>"`。
- 新增 schema 时同步更新 `app/shared/module_registry.py` 和 Alembic migration。
- 脚本级直连（绕过 ORM）仅在数据导入场景使用，如 `scripts/seed.py` 使用 `asyncpg` 原生连接。

### 2.2 缓存（Redis）

- **连接方式**：`redis://`
- **环境变量**：`REDIS_URL`（本地） / `APP_REDIS_URL`（Docker）
- **客户端**：`dazah-backend/app/core/redis.py`
- **提供的功能**：
  - `cache_get(key)` / `cache_set(key, value, ex=3600)` / `cache_delete(key)`
  - `acquire_lock(key, timeout=10)` / `release_lock(key)` — 分布式锁

**典型用法**：

```python
from app.core.redis import cache_get, cache_set, get_redis

value = await cache_get("my_key")
await cache_set("my_key", "value", ex=3600)
redis = await get_redis()
```

### 2.3 独立数据源

**礼品库存数据库**（行政模块）：
- 路径：`dazah-backend/app/modules/administration/repository.py`
- 方式：独立 `asyncpg.connect(GIFT_INVENTORY_DB_URL)` 原生连接
- 用途：行政礼品申领与库存管理，与主库分离

### 2.4 外部 API

| 服务 | 基地址 | 用途 | 关键环境变量 |
|------|--------|------|--------------|
| **飞书开放平台** | `https://open.feishu.cn/open-apis` | HR/行政/培训数据同步、多维表格、IM 消息 | `FEISHU_APP_ID` 等 |
| **Moonshot AI** | `https://api.moonshot.cn/v1` | AI 聊天、考试生成、智能查询 | `MOONSHOT_API_KEY` |
| **Aily（飞书智能伙伴）** | 飞书内嵌 | 智能伙伴集成 | `AILY_APP_ID`（后端） / `NEXT_PUBLIC_AILY_APP_KEY`（前端） |

### 2.5 环境变量速查表（数据源相关）

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/dazah
APP_DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/dazah
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=dazah
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0
APP_REDIS_URL=redis://redis:6379/0
REDIS_PORT=6379

# AI
MOONSHOT_API_KEY=
AI_MODEL=kimi-k2.5

# Aily
AILY_APP_ID=
```

---

## 3. 飞书机器人配置手册

### 3.1 架构总览

项目采用**多 Bot + 多 Base** 架构：

- **多 Bot**：每个业务域可申请独立飞书应用（Bot），各自拥有 `app_id` / `app_secret`，Token 互不冲突。
- **多 Base**：HR 相关表共享同一个 Bitable Base（主 `app_token`），候选人、车辆、培训、产品、物料 BOM 使用独立 Base。

当前已配置 3 个 Bot：

| Bot | 业务域 | 对应模块 | 环境变量前缀 |
|-----|--------|----------|--------------|
| **主 Bot** | 招聘 / HR 台账 | `hr` | `FEISHU_*` |
| **车辆 Bot** | 行政管理（用车） | `administration` | `FEISHU_VEHICLE_*` |
| **培训 Bot** | 培训通知 / 产品 / 物料 BOM | 培训 | `FEISHU_TRAINING_*` |

### 3.2 机器人配置清单

**主 Bot（招聘 / HR）**：
- `FEISHU_BOT_NAME` — 机器人名称标识
- `FEISHU_APP_ID` / `FEISHU_APP_SECRET` — 主应用凭证

**车辆 Bot（行政）**：
- `FEISHU_VEHICLE_APP_ID` / `FEISHU_VEHICLE_APP_SECRET`

**培训 Bot**：
- `FEISHU_TRAINING_APP_ID` / `FEISHU_TRAINING_APP_SECRET`

### 3.3 Bitable 表 Token / ID 清单

| 业务域 | 表名 | App Token 环境变量 | Table ID 环境变量 | 所属 Bot |
|--------|------|---------------------|-------------------|----------|
| 员工花名册 | 员工表 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_EMPLOYEE_TABLE_ID` | 主 Bot |
| 部门 | 部门表 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_DEPARTMENT_TABLE_ID` | 主 Bot |
| 离职 | 离职表 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_OFFBOARDING_TABLE_ID` | 主 Bot |
| 入职 | 入职表 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_ONBOARDING_TABLE_ID` | 主 Bot |
| 老厂离职 | 离职数据源 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_DEPARTURE_TABLE_ID` | 主 Bot |
| 审批 | 审批表 | `FEISHU_BITABLE_APP_TOKEN` | `FEISHU_BITABLE_APPROVAL_TABLE_ID` | 主 Bot |
| 招聘候选人 | 候选人表 | `FEISHU_BITABLE_CANDIDATE_APP_TOKEN` | `FEISHU_BITABLE_CANDIDATE_TABLE_ID` | 主 Bot |
| 用车申请 | 用车申请表 | `FEISHU_BITABLE_VEHICLE_REQUEST_APP_TOKEN` | `FEISHU_BITABLE_VEHICLE_REQUEST_TABLE_ID` | 车辆 Bot |
| 培训通知 | 培训通知表 | `FEISHU_BITABLE_TRAINING_NOTIFICATION_APP_TOKEN` | `FEISHU_BITABLE_TRAINING_NOTIFICATION_TABLE_ID` | 培训 Bot |
| 产品 | 产品表 | `FEISHU_BITABLE_PRODUCT_APP_TOKEN` | `FEISHU_BITABLE_PRODUCT_TABLE_ID` | 培训 Bot |
| 物料 BOM | 物料表 | `FEISHU_BITABLE_MATERIAL_BOM_APP_TOKEN` | `FEISHU_BITABLE_MATERIAL_BOM_TABLE_ID` | 培训 Bot |

**注意事项**：
- 候选人使用**独立 Base**（独立 `app_token`），与 HR 主 Base 分离。
- 车辆、培训也各自使用独立 Base。
- 所有 `app_token` 和 `table_id` 未配置时，对应同步逻辑会自动跳过（通过 `_is_enabled()` 检查），不会报错阻断业务。

### 3.4 核心基础设施与复用方式

以下文件提供了跨模块复用的飞书基础设施，新增模块应优先复用而非重新实现：

| 文件 | 职责 | 复用方式 |
|------|------|----------|
| `app/platform/integrations/feishu/auth.py` | `FeishuAuth` — 多 Bot Token 管理，含 60 秒提前过期缓存 | `FeishuAuth.default()` / `.vehicle()` / `.training()` |
| `app/platform/integrations/feishu/client.py` | `FeishuClient` — HTTP 客户端（自动注入 Token、重试、文件上传） | 初始化时传入 `auth` 实例 |
| `app/platform/integrations/feishu/datasource.py` | `BitableDataSource` — 通用 Bitable 数据源（CRUD + 批量 upsert） | 继承此类实现模块级数据源 |
| `app/platform/integrations/feishu/sync.py` | `run_sync()` — 通用同步编排器（获取 → 解析 → 写入 → 统计） | 传入 `fetch_records` / `parse_record` / `upsert_record` 等回调 |
| `app/platform/integrations/feishu/fields.py` | 字段提取工具（文本、数字、单选、多选、附件、日期等） | 直接调用工具函数处理 Bitable 返回的字段格式 |
| `app/platform/integrations/feishu/im.py` | `FeishuIM` — 批量获取用户 `open_id`、发送单聊文本消息 | 初始化后调用 `batch_get_open_ids_by_*` / `send_text_message` |
| `app/platform/integrations/feishu/bitable.py` | `FeishuBitableSync` — HR 数据主动推送到飞书的封装 | 在业务 Service 层事务成功后调用同步方法 |

**模块导出**：`app/platform/integrations/feishu/__init__.py` 已暴露常用类，可直接 import：

```python
from app.platform.integrations.feishu import (
    FeishuClient,
    FeishuBitableSync,
    BitableDataSource,
    EmployeeBitableDataSource,
    CandidateBitableDataSource,
    fields,
    sync,
)
```

### 3.5 同步机制说明

项目支持两种同步方向：

#### 方向 A：本地 DB → 飞书 Bitable（主动推送）

适用于本地业务数据变更后，实时同步到飞书多维表格。

- 核心类：`FeishuBitableSync`（`app/platform/integrations/feishu/bitable.py`）
- 触发位置：通常在业务 Service 层，事务提交成功后调用
- 示例方法：
  - `sync_department_created(dept)` / `sync_department_updated(dept)` / `sync_department_deleted(code)`
  - `sync_employee_created(emp)` / `sync_employee_updated(emp)` / `sync_employee_deleted(employee_number)`
  - `sync_offboarding_created(record)` / `sync_offboarding_updated(record)`
  - `sync_approval_created(emp)` / `check_approval_status(employee_number)`

**特点**：
- 同步是**同步调用**（在业务事务成功后触发），非异步队列。
- 若未配置 `app_token` 或 `table_id`，同步自动跳过（`_is_enabled()` 检查）。
- Bitable 字段名使用**中文**（如 `"工号"`, `"姓名"`, `"部门"`），代码中通过工具函数处理格式差异。
- 日期字段通过 `_to_ms_timestamp()` 转为毫秒时间戳（UTC）。

#### 方向 B：飞书 Bitable → 本地 DB（定时/手动拉取）

适用于将飞书作为数据源，批量同步到本地 PostgreSQL。

- 核心函数：`run_sync()`（`app/platform/integrations/feishu/sync.py`）
- 模式：传入 `fetch_records` / `parse_record` / `upsert_record` / `get_existing` / `get_record_id` 回调
- 返回统计：`{"created": int, "updated": int, "failed": int, "total": int}`

**示例**：

```python
from app.platform.integrations.feishu.sync import run_sync

stats = await run_sync(
    fetch_records=ds.fetch_all,           # 从飞书拉取原始记录
    parse_record=parse_candidate,          # 解析为本地 DB 字段
    upsert_record=upsert_candidate,        # 写入本地 DB
    get_existing=get_candidate_by_feishu_id, # 查询本地是否已存在
    get_record_id=lambda x: x["feishu_record_id"], # 提取唯一键
    post_process=notify_created,           # 可选后置处理（如发通知）
)
```

### 3.6 新增模块接入飞书的步骤

若后续新模块需要与飞书 Bitable 集成，按以下步骤执行：

1. **申请飞书应用**：
   - 评估复用现有 Bot（主 Bot / 车辆 Bot / 培训 Bot）还是申请新 Bot。
   - 每个 Bot 需要独立的 `app_id` / `app_secret`。

2. **创建 Bitable Base 和表**：
   - 在飞书多维表格中创建 Base，获取 `app_token`（在 URL 中）。
   - 创建表，获取 `table_id`（在开发者模式下查看）。

3. **配置环境变量**：
   - 在 `app/core/config.py` 的 `Settings` 类中新增配置项（如 `FEISHU_XXX_APP_ID`）。
   - 在 `.env` 和 `.env.example` 中补充实际值和占位值。

4. **实现模块级数据源**：
   - 在 `app/platform/integrations/feishu/` 下新建 `xxx_datasource.py`。
   - 继承 `BitableDataSource`（`app/platform/integrations/feishu/datasource.py`）。
   - 定义字段映射常量，参考 `employee_datasource.py` / `candidate_datasource.py` 的写法。
   - 使用 `fields.py` 中的工具函数处理飞书字段格式。

5. **实现同步逻辑**：
   - 若需要**本地 → 飞书**推送：参考 `bitable.py` 中的 `FeishuBitableSync`，在业务 Service 层事务成功后调用。
   - 若需要**飞书 → 本地**拉取：使用 `run_sync()` 通用编排器，在模块内定义 `fetch_records` / `parse_record` / `upsert_record` 回调。

6. **注册模块导出（可选）**：
   - 若其他模块需要调用，在 `app/platform/integrations/feishu/__init__.py` 中导出新增的数据源类。

7. **测试验证**：
   - 确保 `app_token` / `table_id` 未配置时，同步逻辑自动跳过，不报错阻断。
   - 验证字段映射（特别是中文字段名、日期毫秒时间戳、附件 `file_token`）。

### 3.7 飞书 IM 消息发送

适用于向指定用户发送单聊文本通知（如审批提醒、同步结果通知）。

**核心类**：`FeishuIM`（`app/platform/integrations/feishu/im.py`）

```python
from app.platform.integrations.feishu.im import FeishuIM

im = FeishuIM()  # 默认使用主 Bot

# 通过手机号批量获取 open_id
open_ids = await im.batch_get_open_ids_by_mobile(["13800138000"])

# 发送单聊文本消息
await im.send_text_message(
    receive_id="ou_xxx",
    content="你好，这是系统通知",
    receive_id_type="open_id",  # 支持 open_id / user_id / union_id / email / chat_id
)
```

**底层 API**：
- 批量获取 ID：`POST /contact/v3/users/batch_get_id`
- 发送消息：`POST /im/v1/messages?receive_id_type={type}`

**注意**：
- `batch_get_open_ids_by_employee_id` 支持 `include_resigned=True`（包含已离职员工）。
- 发送消息前必须先获取 `open_id`，不可直接用手机号发送。

### 3.8 飞书 AI 查询配置

- `FEISHU_AI_QUERY_TABLES`：JSON 字符串，定义 AI 查询可用的 Bitable 表格别名映射。
  - 格式：`{"别名": {"app_token": "...", "table_id": "...", "filterable_fields": [...]}}`
- `FEISHU_AI_QUERY_MAX_ROWS`：AI 查询最大返回行数，默认 `200`。
- 用途：支持 AI 助手通过自然语言查询 Bitable 数据（如员工信息查询）。

---

## 4. 现有模块的数据源与飞书集成映射

| 模块 | 目录 | 涉及的数据源 | 飞书 Bot | 飞书 Base / 表 |
|------|------|-------------|----------|----------------|
| **人事** | `app/modules/hr/` | PostgreSQL（主库） | 主 Bot | 员工表、部门表、离职表、入职表、老厂离职表、审批表、候选人表 |
| **行政** | `app/modules/administration/` | PostgreSQL（主库）+ 独立礼品库存 DB | 车辆 Bot | 用车申请表 |
| **培训** | （历史模块） | PostgreSQL（主库） | 培训 Bot | 培训通知表、产品表、物料 BOM 表 |
| **生产、设备、安全、环保、能源、仓储、采购、研发、注册、质量** | 各 `app/modules/<module>/` | PostgreSQL（主库） | 暂无 | 暂无（可按 3.6 节接入） |

---

## 5. 关键文件索引

### 5.1 数据源与基础设施

| 文件 | 说明 |
|------|------|
| `dazah-backend/app/core/config.py` | 所有环境变量定义（数据库、Redis、飞书、AI） |
| `dazah-backend/app/core/database.py` | SQLAlchemy 2.0 异步引擎和会话工厂 |
| `dazah-backend/app/core/redis.py` | Redis 客户端、缓存、分布式锁 |
| `dazah-backend/app/shared/base_model.py` | ORM 基类 `BaseModel` |
| `dazah-backend/app/shared/module_registry.py` | 业务模块 schema 注册表 |
| `dazah-backend/.env.example` | 后端环境变量模板 |
| `dazah-frontend/.env.example` | 前端环境变量模板（含 `NEXT_PUBLIC_AILY_APP_KEY`） |

### 5.2 飞书集成

| 文件 | 说明 |
|------|------|
| `dazah-backend/app/platform/integrations/feishu/auth.py` | 多 Bot Token 管理（`FeishuAuth`） |
| `dazah-backend/app/platform/integrations/feishu/client.py` | HTTP 客户端（`FeishuClient`） |
| `dazah-backend/app/platform/integrations/feishu/im.py` | IM 消息发送（`FeishuIM`） |
| `dazah-backend/app/platform/integrations/feishu/bitable.py` | Bitable CRUD + HR 同步推送（`FeishuBitableSync`） |
| `dazah-backend/app/platform/integrations/feishu/sync.py` | 通用同步编排器（`run_sync`） |
| `dazah-backend/app/platform/integrations/feishu/datasource.py` | 通用数据源（`BitableDataSource`） |
| `dazah-backend/app/platform/integrations/feishu/employee_datasource.py` | 员工数据源（`EmployeeBitableDataSource`） |
| `dazah-backend/app/platform/integrations/feishu/candidate_datasource.py` | 候选人数据源（`CandidateBitableDataSource`） |
| `dazah-backend/app/platform/integrations/feishu/departure_datasource.py` | 老厂离职数据源 |
| `dazah-backend/app/platform/integrations/feishu/onboarding_datasource.py` | 老厂入职数据源 |
| `dazah-backend/app/platform/integrations/feishu/fields.py` | 字段提取工具函数 |
| `dazah-backend/app/platform/integrations/feishu/__init__.py` | 模块公共导出 |
| `dazah-backend/app/platform/ai/feishu_context.py` | 飞书 AI 查询上下文 |
| `dazah-backend/scripts/sync_feishu_open_ids.py` | 同步员工 open_id 脚本 |
| `dazah-backend/scripts/sync_feishu_to_clone_tables.py` | 同步飞书数据到克隆表脚本 |
| `dazah-backend/scripts/sync_feishu_vehicle.py` | 同步车辆数据脚本 |

---

## 6. 环境变量模板（飞书部分）

以下模板可直接复制到 `.env.example` 中，供新模块开发者参考：

```bash
# ============================================================
# 飞书机器人配置（多 Bot 架构）
# ============================================================

# 主 Bot（招聘 / HR 台账）
FEISHU_BOT_NAME=
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_BITABLE_APP_TOKEN=               # 主 Base
FEISHU_BITABLE_EMPLOYEE_TABLE_ID=
FEISHU_BITABLE_DEPARTMENT_TABLE_ID=
FEISHU_BITABLE_OFFBOARDING_TABLE_ID=
FEISHU_BITABLE_ONBOARDING_TABLE_ID=
FEISHU_BITABLE_DEPARTURE_TABLE_ID=
FEISHU_BITABLE_APPROVAL_TABLE_ID=
FEISHU_BITABLE_CANDIDATE_APP_TOKEN=       # 独立 Base
FEISHU_BITABLE_CANDIDATE_TABLE_ID=

# 车辆 Bot（行政管理）
FEISHU_VEHICLE_APP_ID=
FEISHU_VEHICLE_APP_SECRET=
FEISHU_BITABLE_VEHICLE_REQUEST_APP_TOKEN=
FEISHU_BITABLE_VEHICLE_REQUEST_TABLE_ID=

# 培训 Bot（培训通知 / 产品 / 物料 BOM）
FEISHU_TRAINING_APP_ID=
FEISHU_TRAINING_APP_SECRET=
FEISHU_BITABLE_TRAINING_NOTIFICATION_APP_TOKEN=
FEISHU_BITABLE_TRAINING_NOTIFICATION_TABLE_ID=
FEISHU_BITABLE_PRODUCT_APP_TOKEN=
FEISHU_BITABLE_PRODUCT_TABLE_ID=
FEISHU_BITABLE_MATERIAL_BOM_APP_TOKEN=
FEISHU_BITABLE_MATERIAL_BOM_TABLE_ID=

# 飞书 AI 查询配置
FEISHU_AI_QUERY_TABLES={}
FEISHU_AI_QUERY_MAX_ROWS=200

# Aily（飞书智能伙伴）
AILY_APP_ID=
```

---

## 7. 新增模块开发 checklist

在后续模块开发中，涉及数据源引用和飞书集成时，请按以下 checklist 检查：

- [ ] 数据库 schema 是否已在 `module_registry.py` 中注册？
- [ ] ORM 模型是否继承 `BaseModel` 并正确声明 `schema`？
- [ ] 是否需要连接新的飞书 Bot？（评估复用 vs 新建）
- [ ] 是否已在 `app/core/config.py` 中新增环境变量？
- [ ] 是否已在 `.env` 和 `.env.example` 中补充配置？
- [ ] 是否需要实现 `BitableDataSource` 子类？
- [ ] 同步方向是"本地 → 飞书"还是"飞书 → 本地"？是否选择了正确的同步机制？
- [ ] Bitable 字段名是否使用中文？日期是否已处理为毫秒时间戳？
- [ ] 未配置 `app_token` 时，同步逻辑是否能优雅跳过（不报错）？
- [ ] 是否已通过 `FeishuAuth` 获取 Token，而非硬编码？

---

# Karpathy-Inspired Coding Guidelines

## 1. Think Before Coding

**不要假设。不要隐藏困惑。呈现权衡。**

实现前：
- 明确陈述你的假设。如果不确定，就问。
- 如果存在多种解释，请呈现出来——不要默默选择。
- 如果存在更简单的方法，说出来。该反对时就反对。
- 如果某事不清楚，停下来。指明困惑之处。提问。

## 2. Simplicity First

**最少代码解决问题。不做推测性编码。**

- 不要添加超出需求的功能。
- 不要为一次性代码做抽象。
- 不要添加未被要求的"灵活性"或"可配置性"。
- 不要为不可能发生的场景写错误处理。
- 如果你写了 200 行但 50 行就能搞定，重写它。

问自己："资深工程师会说这过度复杂了吗？" 如果是，简化。

## 3. Surgical Changes

**只碰必须碰的。只清理自己制造的混乱。**

编辑现有代码时：
- 不要"改进"相邻代码、注释或格式。
- 不要重构没坏的东西。
- 匹配现有风格，即使你会用不同方式写。
- 如果注意到无关的死代码，提一下——不要删。

当你的改动产生孤儿代码时：
- 删除你的改动导致不再使用的 import/变量/函数。
- 不要删除预先存在的死代码，除非被要求。

检验标准：每一行改动都应能直接追溯到用户的请求。

## 4. Goal-Driven Execution

**定义成功标准。循环直到验证通过。**

将任务转化为可验证的目标：
- "添加验证" → "为无效输入写测试，然后让它们通过"
- "修复 bug" → "写个能复现它的测试，然后让它通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务时，陈述简要计划：
```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```
