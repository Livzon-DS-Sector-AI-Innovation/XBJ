#!/bin/bash
taskkill //F //IM python.exe 2>/dev/null
sleep 2
cd /d/LivzonAI/dazah-backend
nohup uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
sleep 3
curl -s http://localhost:8000/health
