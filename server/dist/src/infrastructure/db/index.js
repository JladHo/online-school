"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const connectionString = process.env.DATABASE_URL || 'file:./dev.db';
// Передаем путь к БД напрямую в конструктор адаптера
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
    url: connectionString,
});
// Создаем клиент Prisma, передавая ему адаптер
const globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    adapter,
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
