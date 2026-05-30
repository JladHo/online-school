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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpError_1 = require("../../../errors/HttpError");
const db_1 = require("../../../infrastructure/db");
function generatePassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.userRepository = userRepository;
    }
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // Проверяем, существует ли юзер с таким емейлом
            const existingUserEmail = yield this.userRepository.findByEmail(dto.email);
            if (existingUserEmail) {
                throw new HttpError_1.ConflictError('Пользователь с таким Email уже существует.');
            }
            // Проверяем, существует ли юзер с таким телефоном
            const existingUserPhone = yield this.userRepository.findByPhone(dto.phone);
            if (existingUserPhone) {
                throw new HttpError_1.ConflictError('Пользователь с таким номером телефона уже существует.');
            }
            const generatedPassword = generatePassword();
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
            const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, saltRounds);
            // Создаем юзера в БД
            const newUser = yield this.userRepository.create(Object.assign(Object.assign({}, dto), { password: hashedPassword }));
            return { user: newUser, generatedPassword };
        });
    }
    login(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ищем юзера с емейлом
            const user = yield this.userRepository.findByEmailWithPassword(dto.email);
            if (!user) {
                throw new HttpError_1.ConflictError('Пользователь с таким Email не найден.');
            }
            // Проверяем его пароль
            const comparePassword = yield bcrypt_1.default.compare(dto.password, user.password);
            if (!comparePassword) {
                throw new HttpError_1.UnauthorizedError('Неверный пароль.');
            }
            // Делаем токен
            const payload = { id: user.id, email: user.email, role: user.role };
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT токен не определен.');
            }
            const accessToken = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '24h' });
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return { user: userWithoutPassword, accessToken };
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findById(id);
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findAll();
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataToUpdate = Object.assign({}, dto);
            if (dto.password) {
                const hashedPassword = yield bcrypt_1.default.hash(dto.password, 10);
                dataToUpdate.password = hashedPassword;
            }
            const updateUser = yield this.userRepository.update(id, dataToUpdate);
            return updateUser;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.delete(id);
        });
    }
    getPointsHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.pointTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    getStoreItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.storeItem.findMany();
        });
    }
    getUserCourses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchases = yield db_1.prisma.purchase.findMany({
                where: { userId },
                include: { course: true }
            });
            return purchases.map(p => p.course);
        });
    }
    getUserGroups(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const links = yield db_1.prisma.studentGroup.findMany({
                where: { studentId: userId },
                include: { group: true }
            });
            return links.map(l => l.group);
        });
    }
    getStudentsForManager() {
        return __awaiter(this, void 0, void 0, function* () {
            const students = yield db_1.prisma.user.findMany({
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
        });
    }
    getFreePool() {
        return __awaiter(this, void 0, void 0, function* () {
            const students = yield db_1.prisma.user.findMany({
                where: { role: 'user' },
                include: {
                    studentGroups: { include: { group: true } },
                    purchases: { include: { course: true } }
                }
            });
            const pool = [];
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
        });
    }
    purchaseStoreItem(userId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield db_1.prisma.storeItem.findUnique({ where: { id: itemId } });
            if (!item)
                throw new HttpError_1.ConflictError('Товар не найден');
            const user = yield this.userRepository.findById(userId);
            if (!user)
                throw new HttpError_1.ConflictError('Пользователь не найден');
            if ((user.bonusPoints || 0) < item.price) {
                throw new HttpError_1.ConflictError('Недостаточно баллов');
            }
            // Deduct points
            const updatedUser = yield db_1.prisma.user.update({
                where: { id: userId },
                data: { bonusPoints: { decrement: item.price } }
            });
            // Add transaction
            yield db_1.prisma.pointTransaction.create({
                data: {
                    userId,
                    amount: -item.price,
                    reason: `Покупка: ${item.title}`
                }
            });
            // Create Order
            yield db_1.prisma.storeOrder.create({
                data: {
                    userId,
                    itemId
                }
            });
            return updatedUser;
        });
    }
    grantCourseAccess(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            if (!user)
                throw new HttpError_1.ConflictError('Пользователь не найден');
            // Check if already has access
            const existingPurchase = yield db_1.prisma.purchase.findFirst({
                where: { userId, courseId }
            });
            if (existingPurchase)
                throw new HttpError_1.ConflictError('Ученик уже имеет доступ к этому курсу');
            const course = yield db_1.prisma.course.findUnique({ where: { id: courseId } });
            const purchase = yield db_1.prisma.purchase.create({
                data: {
                    userId,
                    courseId,
                    purchasePrice: (course === null || course === void 0 ? void 0 : course.price) || 0,
                    purchaseAt: new Date(),
                    customerName: user.fullName || user.studentName,
                    customerEmail: user.email,
                    customerPhone: user.phone
                }
            });
            return purchase;
        });
    }
    revokeCourseAccess(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchase = yield db_1.prisma.purchase.findFirst({
                where: { userId, courseId }
            });
            if (!purchase)
                throw new HttpError_1.ConflictError('Ученик не имеет доступа к этому курсу');
            yield db_1.prisma.purchase.delete({
                where: { id: purchase.id }
            });
        });
    }
    getStoreOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.storeOrder.findMany({
                include: {
                    user: { select: { id: true, fullName: true, studentName: true, email: true, phone: true } },
                    item: true,
                    manager: { select: { id: true, fullName: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    updateStoreOrder(orderId, status, managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.storeOrder.update({
                where: { id: orderId },
                data: { status, managerId }
            });
        });
    }
}
exports.UserService = UserService;
