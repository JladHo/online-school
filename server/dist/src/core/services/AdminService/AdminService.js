"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const db_1 = require("../../../infrastructure/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AdminService {
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Финансы
            const purchases = yield db_1.prisma.purchase.findMany();
            const totalRevenue = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const currentMonthPurchases = purchases.filter(p => new Date(p.purchaseAt) >= firstDayOfMonth);
            const currentMonthRevenue = currentMonthPurchases.reduce((sum, p) => sum + p.purchasePrice, 0);
            // Конверсия заявок
            const applications = yield db_1.prisma.application.findMany();
            const totalApplications = applications.length;
            const closedApplications = applications.filter(a => a.status === 'closed').length;
            const conversionRate = totalApplications > 0 ? Math.round((closedApplications / totalApplications) * 100) : 0;
            // Пользователи по ролям
            const users = yield db_1.prisma.user.groupBy({
                by: ['role'],
                _count: { id: true }
            });
            const usersByRole = {
                admin: ((_a = users.find(u => u.role === 'admin')) === null || _a === void 0 ? void 0 : _a._count.id) || 0,
                manager: ((_b = users.find(u => u.role === 'manager')) === null || _b === void 0 ? void 0 : _b._count.id) || 0,
                teacher: ((_c = users.find(u => u.role === 'teacher')) === null || _c === void 0 ? void 0 : _c._count.id) || 0,
                user: ((_d = users.find(u => u.role === 'user')) === null || _d === void 0 ? void 0 : _d._count.id) || 0,
            };
            // Академическая сводка
            const totalSessions = yield db_1.prisma.lessonSession.count({
                where: { scheduledAt: { lt: now } }
            });
            // Лидерборд
            const topStudents = yield db_1.prisma.user.findMany({
                where: { role: 'user' },
                orderBy: { bonusPoints: 'desc' },
                take: 5,
                select: { id: true, studentName: true, fullName: true, bonusPoints: true }
            });
            return {
                financials: { totalRevenue, currentMonthRevenue },
                applications: { totalApplications, closedApplications, conversionRate },
                users: usersByRole,
                academic: { totalSessions },
                topStudents
            };
        });
    }
    // --- USERS CRUD ---
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.findMany({
                orderBy: { id: 'desc' },
                select: { id: true, email: true, phone: true, role: true, fullName: true, studentName: true, parentName: true, birthday: true }
            });
        });
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield db_1.prisma.user.findUnique({ where: { email: data.email } });
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }
            if (data.phone && data.phone.trim() !== '') {
                const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
                if (!phoneRegex.test(data.phone)) {
                    throw new Error('Некорректный формат российского номера телефона');
                }
                const existingPhone = yield db_1.prisma.user.findFirst({ where: { phone: data.phone } });
                if (existingPhone) {
                    throw new Error('Пользователь с таким номером телефона уже существует');
                }
            }
            const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
            return db_1.prisma.user.create({
                data: Object.assign(Object.assign({}, data), { password: hashedPassword, birthday: data.birthday ? new Date(data.birthday) : undefined }),
                select: { id: true, email: true, role: true }
            });
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.email) {
                const existingUser = yield db_1.prisma.user.findFirst({ where: { email: data.email, id: { not: id } } });
                if (existingUser) {
                    throw new Error('Пользователь с таким email уже существует');
                }
            }
            if (data.phone && data.phone.trim() !== '') {
                const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
                if (!phoneRegex.test(data.phone)) {
                    throw new Error('Некорректный формат российского номера телефона');
                }
                const existingPhone = yield db_1.prisma.user.findFirst({ where: { phone: data.phone, id: { not: id } } });
                if (existingPhone) {
                    throw new Error('Пользователь с таким номером телефона уже существует');
                }
            }
            const updateData = Object.assign({}, data);
            if (updateData.password) {
                updateData.password = yield bcrypt_1.default.hash(updateData.password, 10);
            }
            else {
                delete updateData.password;
            }
            if (updateData.birthday !== undefined) {
                updateData.birthday = updateData.birthday ? new Date(updateData.birthday) : null;
            }
            return db_1.prisma.user.update({
                where: { id },
                data: updateData,
                select: { id: true, email: true, role: true }
            });
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.user.delete({ where: { id } });
        });
    }
    // --- COURSES CRUD ---
    getAllCourses() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.course.findMany({
                include: {
                    _count: { select: { modules: true, purchases: true } }
                }
            });
        });
    }
    createCourse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.course.create({ data });
        });
    }
    updateCourse(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.course.update({
                where: { id },
                data
            });
        });
    }
    deleteCourse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.course.delete({ where: { id } });
        });
    }
    // --- SALES HISTORY ---
    getSalesHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.purchase.findMany({
                orderBy: { purchaseAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, fullName: true, studentName: true, phone: true } },
                    course: { select: { id: true, title: true, price: true } }
                }
            });
        });
    }
}
exports.AdminService = AdminService;
