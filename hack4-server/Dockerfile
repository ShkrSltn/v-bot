# Stage 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Stage 2: Продакшн-образ
FROM node:20-alpine

WORKDIR /app

# Копируем только необходимые файлы из этапа сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Создаем пользователя с ограниченными привилегиями
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Меняем владельца директории uploads
RUN chown -R appuser:appgroup /app

# Принудительно используем IPv4 для DNS
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# Переключаемся на пользователя с ограниченными правами
USER appuser

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start:prod"]