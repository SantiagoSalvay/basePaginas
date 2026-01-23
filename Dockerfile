# ===============================
# Build stage
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN npx prisma generate
RUN pnpm run build

# ===============================
# Production stage
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 👉 INSTALAR PNPM EN RUNTIME
RUN npm install -g pnpm

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/middleware.js ./

EXPOSE 3000

CMD ["pnpm", "run", "start"]
