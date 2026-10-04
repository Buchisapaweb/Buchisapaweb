# Multi-stage Dockerfile for BuchiSapa Full-Stack Restaurant App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Vite frontend, compile HTML partials, and bundle Express server.cjs
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and production dependencies
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/admin ./admin
COPY --from=builder /app/index.html ./index.html

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
