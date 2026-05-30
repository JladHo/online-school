FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для TypeScript)
RUN npm install

# Копируем весь исходный код сервера
COPY . .

# Генерируем Prisma Client (чтобы ORM понимал базу данных)
RUN npx prisma generate

# Компилируем TypeScript в обычный JavaScript (появится папка dist)
RUN npx tsc

# Говорим Докеру, что сервер будет слушать порт 3000
EXPOSE 3000

# Команда для запуска сервера (уже скомпилированного)
CMD ["node", "dist/index.js"]