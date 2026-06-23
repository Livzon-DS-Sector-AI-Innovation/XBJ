FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 设置国内 npm 镜像源，避免容器内 TLS 连接问题
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# 复制源码
COPY . .

# 构建环境变量
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV API_BASE_URL=http://backend:8000
ENV NODE_ENV=production

# 构建前端
RUN pnpm build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# 仅复制构建产物和必要文件
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# 写入启动脚本：替换服务端渲染和客户端 JS 中的 localhost:8000
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Replacing server API base URL with: http://backend:8000"' >> /app/start.sh && \
    echo 'find /app/.next/server -type f \( -name "*.js" -o -name "*.js.map" \) -exec sed -i "s|http://localhost:8000|http://backend:8000|g" {} +' >> /app/start.sh && \
    echo 'echo "Replacing client API base URL with: /api/v1 (relative path via nginx)"' >> /app/start.sh && \
    echo 'find /app/.next/static -type f \( -name "*.js" -o -name "*.js.map" \) -exec sed -i "s|http://localhost:8000||g" {} +' >> /app/start.sh && \
    echo 'exec pnpm start' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
