import { prisma } from '../../../infrastructure/db';
import bcrypt from 'bcrypt';
import { NotFoundError } from '../../../errors/HttpError';

export class AdminService {
    async getStats() {
        // Финансы
        const purchases = await prisma.purchase.findMany();
        const totalRevenue = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthPurchases = purchases.filter(p => new Date(p.purchaseAt) >= firstDayOfMonth);
        const currentMonthRevenue = currentMonthPurchases.reduce((sum, p) => sum + p.purchasePrice, 0);

        // Конверсия заявок
        const applications = await prisma.application.findMany();
        const totalApplications = applications.length;
        const closedApplications = applications.filter(a => a.status === 'closed').length;
        const conversionRate = totalApplications > 0 ? Math.round((closedApplications / totalApplications) * 100) : 0;

        // Пользователи по ролям
        const users = await prisma.user.groupBy({
            by: ['role'],
            _count: { id: true }
        });
        const usersByRole = {
            admin: users.find(u => u.role === 'admin')?._count.id || 0,
            manager: users.find(u => u.role === 'manager')?._count.id || 0,
            teacher: users.find(u => u.role === 'teacher')?._count.id || 0,
            user: users.find(u => u.role === 'user')?._count.id || 0,
        };

        // Академическая сводка
        const totalSessions = await prisma.lessonSession.count({
            where: { scheduledAt: { lt: now } }
        });

        // Лидерборд
        const topStudents = await prisma.user.findMany({
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
    }

    // --- USERS CRUD ---
    async getAllUsers() {
        return prisma.user.findMany({
            orderBy: { id: 'desc' },
            select: { id: true, email: true, phone: true, role: true, fullName: true, studentName: true, parentName: true, birthday: true }
        });
    }

    async createUser(data: any) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }

        if (data.phone && data.phone.trim() !== '') {
            const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
            if (!phoneRegex.test(data.phone)) {
                throw new Error('Некорректный формат российского номера телефона');
            }

            const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } });
            if (existingPhone) {
                throw new Error('Пользователь с таким номером телефона уже существует');
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                birthday: data.birthday ? new Date(data.birthday) : undefined
            },
            select: { id: true, email: true, role: true }
        });
    }

    async updateUser(id: number, data: any) {
        if (data.email) {
            const existingUser = await prisma.user.findFirst({ where: { email: data.email, id: { not: id } } });
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }
        }

        if (data.phone && data.phone.trim() !== '') {
            const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
            if (!phoneRegex.test(data.phone)) {
                throw new Error('Некорректный формат российского номера телефона');
            }

            const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone, id: { not: id } } });
            if (existingPhone) {
                throw new Error('Пользователь с таким номером телефона уже существует');
            }
        }

        const updateData = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }
        if (updateData.birthday !== undefined) {
            updateData.birthday = updateData.birthday ? new Date(updateData.birthday) : null;
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, role: true }
        });
    }

    async deleteUser(id: number) {
        return prisma.user.delete({ where: { id } });
    }

    // --- COURSES CRUD ---
    async getAllCourses() {
        return prisma.course.findMany({
            include: {
                _count: { select: { modules: true, purchases: true } }
            }
        });
    }

    async createCourse(data: any) {
        return prisma.course.create({ data });
    }

    async updateCourse(id: number, data: any) {
        return prisma.course.update({
            where: { id },
            data
        });
    }

    async deleteCourse(id: number) {
        return prisma.course.delete({ where: { id } });
    }

    // --- SALES HISTORY ---
    async getSalesHistory() {
        return prisma.purchase.findMany({
            orderBy: { purchaseAt: 'desc' },
            include: {
                user: { select: { id: true, email: true, fullName: true, studentName: true, phone: true } },
                course: { select: { id: true, title: true, price: true } }
            }
        });
    }
}
