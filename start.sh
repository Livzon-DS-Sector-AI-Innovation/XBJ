#!/usr/bin/env bash
# LivzonAI 一键启动脚本
# 用法: bash start.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/dazah-backend"
FRONTEND_DIR="$PROJECT_ROOT/dazah-frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     LivzonAI 一键启动脚本              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 检查端口占用
check_port() {
    local port=$1
    local name=$2
    local pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1)
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
        echo -e "${YELLOW}⚠ $name 端口 $port 已被占用 (PID: $pid)${NC}"
        return 1
    fi
    return 0
}

# 清理残留进程
cleanup_port() {
    local port=$1
    local pids=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | sort -u)
    for pid in $pids; do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            echo -e "${YELLOW}  终止占用 $port 的进程 PID=$pid${NC}"
            taskkill //F //PID "$pid" 2>/dev/null || true
        fi
    done
}

# 检查并清理端口
echo -e "${BLUE}▶ 检查端口占用...${NC}"
BACKEND_PID=$(netstat -ano 2>/dev/null | grep ":8000 " | grep LISTENING | awk '{print $5}' | head -1)
FRONTEND_PID=$(netstat -ano 2>/dev/null | grep ":3000 " | grep LISTENING | awk '{print $5}' | head -1)

if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}发现已有服务运行:${NC}"
    [ -n "$BACKEND_PID" ] && echo "  后端 http://localhost:8000 (PID: $BACKEND_PID)"
    [ -n "$FRONTEND_PID" ] && echo "  前端 http://localhost:3000 (PID: $FRONTEND_PID)"
    echo ""
    echo -e "${YELLOW}先停止旧服务...${NC}"
    cleanup_port 8000
    cleanup_port 3000
    sleep 2
fi

echo -e "${GREEN}✓ 端口已清理${NC}"
echo ""

# 启动后端
echo -e "${BLUE}▶ 启动后端服务 (FastAPI)...${NC}"
cd "$BACKEND_DIR"
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ 后端已启动 (PID: $BACKEND_PID)${NC}"

# 等待后端就绪
echo -n "  等待后端就绪"
for i in {1..30}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}  ✓ 后端健康检查通过${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# 启动前端
echo -e "${BLUE}▶ 启动前端服务 (Next.js)...${NC}"
cd "$FRONTEND_DIR"
pnpm dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ 前端已启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端就绪
echo -n "  等待前端就绪"
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}  ✓ 前端响应正常${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# 保存 PID 到文件
echo "$BACKEND_PID" > "$PROJECT_ROOT/.backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/.frontend.pid"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        所有服务已启动！                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}前端页面:${NC}  http://localhost:3000"
echo -e "  ${BLUE}后端 API:${NC}  http://localhost:8000"
echo -e "  ${BLUE}API 文档:${NC}  http://localhost:8000/docs"
echo -e "  ${BLUE}健康检查:${NC} http://localhost:8000/health"
echo ""
echo -e "  ${YELLOW}日志文件:${NC}"
echo -e "    后端: $PROJECT_ROOT/backend.log"
echo -e "    前端: $PROJECT_ROOT/frontend.log"
echo ""
echo -e "  ${YELLOW}停止命令:${NC} bash stop.sh"
echo ""
