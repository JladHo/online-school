FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем библиотеки
RUN npm install

# Копируем весь исходный код фронтенда
COPY . .

# Собираем production-версию Next.js
# NEXT_PUBLIC_API_URL передается снаружи (из docker-compose), 
# чтобы фронтенд знал, куда стучаться к бэкенду
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Открываем порт 3001
EXPOSE 3001

# Запускаем продакшен-сервер Next.js
CMD ["npm", "start"]