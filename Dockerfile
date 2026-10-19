# Artリーブ 本番用イメージ（Raspberry Pi 上でビルドするため ARM64 向けに作られる）
# 構成：deps（依存関係）→ build（ビルド）→ runner（実行用の最小構成）
# DB のマイグレーションは docker-compose.yml の migrate サービスが build ステージを使って行う。

# ---- 依存関係 ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# postinstall（prisma generate）は schema をコピーした後の build ステージで実行する
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---- ビルド ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm prisma generate && pnpm build

# ---- 実行 ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd -g 1001 nextjs && useradd -u 1001 -g nextjs -s /usr/sbin/nologin nextjs \
 && mkdir -p /data/uploads && chown nextjs:nextjs /data/uploads
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
