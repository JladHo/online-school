import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const connectionString = process.env.DATABASE_URL || 'file:./dev.db'

// Передаем путь к БД напрямую в конструктор адаптера
const adapter = new PrismaBetterSqlite3({
    url: connectionString,
});

// Создаем клиент Prisma, передавая ему адаптер
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
