import {IUserRepository} from "../../repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../entities/UserEntity";
import {UpdateUserDto} from "../../repositories/UserRepository/dto/UpdateUserDto";
import {LoginDto} from "../../repositories/UserRepository/dto/LoginDto";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ConflictError, UnauthorizedError} from "../../../errors/HttpError";
import { prisma } from '../../../infrastructure/db';

function generatePassword(length = 10): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async create(dto: CreateUserDto): Promise<{ user: UserEntity, generatedPassword: string }> {
        // Проверяем, существует ли юзер с таким емейлом
        const existingUserEmail = await this.userRepository.findByEmail(dto.email);
        if (existingUserEmail) {
            throw new ConflictError('Пользователь с таким Email уже существует.')
        }

        // Проверяем, существует ли юзер с таким телефоном
        const existingUserPhone = await this.userRepository.findByPhone(dto.phone);
        if (existingUserPhone) {
            throw new ConflictError('Пользователь с таким номером телефона уже существует.')
        }

        const generatedPassword = generatePassword();
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

        // Создаем юзера в БД
        const newUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword
        });

        return { user: newUser, generatedPassword };
    }

    async login(dto: LoginDto): Promise<{user: UserEntity, accessToken: string}> {
        // Ищем юзера с емейлом
        const user = await this.userRepository.findByEmailWithPassword(dto.email)
        if (!user) {
            throw new ConflictError('Пользователь с таким Email не найден.');
        }

        // Проверяем его пароль
        const comparePassword = await bcrypt.compare(dto.password, user.password);
        if (!comparePassword) {
            throw new UnauthorizedError('Неверный пароль.');
        }

        // Делаем токен
        const payload = {id: user.id, email: user.email, role: user.role};
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT токен не определен.');
        }

        const accessToken = jwt.sign(payload, secret, {expiresIn: '24h'});
        const {password, ...userWithoutPassword} = user;
        return {user: userWithoutPassword as UserEntity, accessToken};
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRepository.findById(id);
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepository.findAll();
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity | null> {
        const dataToUpdate: UpdateUserDto = { ...dto };
        if (dto.password) {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            dataToUpdate.password = hashedPassword;
        }
        const updateUser = await this.userRepository.update(id, dataToUpdate);
        return updateUser;
    }

    async delete(id: number) {
        return this.userRepository.delete(id);
    }

    async getPointsHistory(userId: number) {
        return prisma.pointTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getStoreItems() {
        return prisma.storeItem.findMany();
    }

    async getUserCourses(userId: number) {
        const purchases = await prisma.purchase.findMany({
            where: { userId },
            include: { course: true }
        });
        return purchases.map(p => p.course);
    }

    async getUserGroups(userId: number) {
        const links = await prisma.studentGroup.findMany({
            where: { studentId: userId },
            include: { group: true }
        });
        return links.map(l => l.group);
    }

    async getStudentsForManager() {
        const students = await prisma.user.findMany({
            where: { role: 'user' },
            include: {
                studentGroups: {
                    include: { group: true }
                },
                purchases: {
                    include: { course: true }
                }
            }
        });
        return students;
    }

    async getFreePool() {
        const students = await prisma.user.findMany({
            where: { role: 'user' },
            include: {
                studentGroups: { include: { group: true } },
                purchases: { include: { course: true } }
            }
        });

        const pool: any[] = [];
        for (const student of students) {
            for (const purchase of student.purchases) {
                const hasGroupForCourse = student.studentGroups.some(sg => sg.group.courseId === purchase.courseId);
                if (!hasGroupForCourse) {
                    pool.push({
                        student: { id: student.id, fullName: student.fullName, studentName: student.studentName, email: student.email, phone: student.phone },
                        course: purchase.course,
                        purchaseAt: purchase.purchaseAt
                    });
                }
            }
        }
        return pool;
    }

    async purchaseStoreItem(userId: number, itemId: number) {
        const item = await prisma.storeItem.findUnique({ where: { id: itemId } });
        if (!item) throw new ConflictError('Товар не найден');

        const user = await this.userRepository.findById(userId);
        if (!user) throw new ConflictError('Пользователь не найден');

        if ((user.bonusPoints || 0) < item.price) {
            throw new ConflictError('Недостаточно баллов');
        }

        // Deduct points
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { bonusPoints: { decrement: item.price } }
        });

        // Add transaction
        await prisma.pointTransaction.create({
            data: {
                userId,
                amount: -item.price,
                reason: `Покупка: ${item.title}`
            }
        });

        // Create Order
        await prisma.storeOrder.create({
            data: {
                userId,
                itemId
            }
        });

        return updatedUser;
    }

    async grantCourseAccess(userId: number, courseId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ConflictError('Пользователь не найден');

        // Check if already has access
        const existingPurchase = await prisma.purchase.findFirst({
            where: { userId, courseId }
        });
        if (existingPurchase) throw new ConflictError('Ученик уже имеет доступ к этому курсу');

        const course = await prisma.course.findUnique({ where: { id: courseId } });

        const purchase = await prisma.purchase.create({
            data: {
                userId,
                courseId,
                purchasePrice: course?.price || 0,
                purchaseAt: new Date(),
                customerName: user.fullName || user.studentName,
                customerEmail: user.email,
                customerPhone: user.phone
            }
        });

        return purchase;
    }

    async revokeCourseAccess(userId: number, courseId: number) {
        const purchase = await prisma.purchase.findFirst({
            where: { userId, courseId }
        });

        if (!purchase) throw new ConflictError('Ученик не имеет доступа к этому курсу');

        await prisma.purchase.delete({
            where: { id: purchase.id }
        });
    }

    async getStoreOrders() {
        return prisma.storeOrder.findMany({
            include: {
                user: { select: { id: true, fullName: true, studentName: true, email: true, phone: true } },
                item: true,
                manager: { select: { id: true, fullName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateStoreOrder(orderId: number, status: any, managerId: number) {
        const order = await prisma.storeOrder.findUnique({
            where: { id: orderId },
            include: { item: true }
        });

        if (!order) throw new ConflictError('Заказ не найден');

        // Возврат баллов при отмене заказа
        if (status === 'cancelled' && order.status !== 'cancelled') {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: order.userId },
                    data: { bonusPoints: { increment: order.item.price } }
                }),
                prisma.pointTransaction.create({
                    data: {
                        userId: order.userId,
                        amount: order.item.price,
                        reason: `Возврат за отмену: ${order.item.title}`
                    }
                }),
                prisma.storeOrder.update({
                    where: { id: orderId },
                    data: { status, managerId }
                })
            ]);
            return prisma.storeOrder.findUnique({ 
                where: { id: orderId }, 
                include: { item: true, user: { select: { id: true, fullName: true, studentName: true, email: true, phone: true } }, manager: { select: { id: true, fullName: true, email: true } } } 
            });
        }

        // В остальных случаях просто обновляем статус
        return prisma.storeOrder.update({
            where: { id: orderId },
            data: { status, managerId },
            include: { item: true, user: { select: { id: true, fullName: true, studentName: true, email: true, phone: true } }, manager: { select: { id: true, fullName: true, email: true } } }
        });
    }
}
