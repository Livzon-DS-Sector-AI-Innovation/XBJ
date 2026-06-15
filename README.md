# LivzonAI - 原料药事业部工厂管理平台

原料药制药厂综合业务管理平台，涵盖生产、设备、安全、环保、能源、仓储、采购、行政、人事、研发、注册、质量等业务模块。

## 项目结构

```
LivzonAI/
├── dazah-frontend/      # 前端：Next.js 14 + React + TypeScript
└── dazah-backend/       # 后端：Python 3.12 + FastAPI + PostgreSQL
```

## 技术栈

- **前端**：Next.js 14, React 18, TypeScript, Tailwind CSS, Ant Design V6
- **后端**：Python 3.12, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Redis, Alembic
- **包管理器**：前端 pnpm，后端 uv

## 快速启动

### 前置要求

- Node.js 18+
- Python 3.12+
- PostgreSQL 15+
- Redis 5+

### 1. 启动数据库

确保 PostgreSQL 和 Redis 服务已运行：

```bash
# PostgreSQL（默认端口 5432）
# Redis（默认端口 6379）
```

### 2. 后端启动

```bash
cd dazah-backend

# 安装依赖
uv sync

# 配置环境变量
cp .env.example .env

# 数据库迁移
uv run alembic upgrade head

# 导入种子数据（部门、班组等初始数据）
uv run python scripts/seed.py

# 启动服务
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端服务地址：http://localhost:8000  
API 文档：http://localhost:8000/docs

### 3. 前端启动

```bash
cd dazah-frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端地址：http://localhost:3000（或 3001 如果被占用）

## 种子数据

项目包含以下种子数据文件：

| 文件 | 内容 | 导入脚本 |
|------|------|----------|
| `dazah-backend/departments.json` | 15 个部门 | `scripts/seed.py` |
| `dazah-backend/teams.json` | 26 个班组 | `scripts/seed.py` |

运行 `uv run python scripts/seed.py` 即可将数据导入数据库。该脚本支持重复执行（已存在的数据会自动跳过）。

## 开发规范

- 后端开发规范见 `dazah-backend/CLAUDE.md`
- 前端开发规范见 `dazah-frontend/CLAUDE.md`

## 常见问题

### Q: 前端报错 `fetch failed`？

检查 `.env.local` 中的 `API_BASE_URL` 是否指向正确的后端地址（默认 `http://localhost:8000`）。

### Q: 数据库连接失败？

检查 `dazah-backend/.env` 中的 `DATABASE_URL` 是否正确，并确认 PostgreSQL 已启动。

### Q: 种子数据导入后没有显示？

刷新前端页面（F5），或检查后端服务是否正常运行。
