# STAGE 1: Builder Node.js para Vite + Server Express
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: PHP 8.3 Apache para Render
FROM php:8.3-apache

# Instalar Node.js y dependencias necesarias
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite

WORKDIR /var/www/html

# Copiar archivos compilados y frontend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data
COPY --from=builder /app/php-admin ./php-admin
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production

EXPOSE 80 3000

CMD ["node", "dist/server.cjs"]
