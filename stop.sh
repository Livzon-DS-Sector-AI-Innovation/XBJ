#!/usr/bin/env bash
# LivzonAI 一键停止脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}▶ 停止 LivzonAI 服务...${NC}"

# 从 PID 文件停止
stop_from_pidfile() {
    local pidfile=$1
    local name=$2
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile" 2>/dev/null)
        if [ -n "$pid" ]; then
            echo -e "  停止 $name (PID: $pid)"
            taskkill //F //PID "$pid" 2>/dev/null || true
            rm -f "$pidfile"
        fi
    fi
}

stop_from_pidfile ".backend.pid" "后端"
stop_from_pidfile ".frontend.pid" "前端"

# 兜底：按端口清理
cleanup_port() {
    local port=$1
    local name=$2
    local pids=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | sort -u)
    for pid in $pids; do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            echo -e "  停止 $name (PID: $pid)"
            taskkill //F //PID "$pid" 2>/dev/null || true
        fi
    done
}

cleanup_port 8000 "后端"
cleanup_port 3000 "前端"

echo -e "${GREEN}✓ 所有服务已停止${NC}"
