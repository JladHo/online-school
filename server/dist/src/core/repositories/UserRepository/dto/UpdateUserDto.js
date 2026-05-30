"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = void 0;
const zod_1 = require("zod");
exports.UpdateUserSchema = zod_1.z.object({
    parentName: zod_1.z.string({ message: 'Имя родителя должно быть строкой.' }).nullable().optional(),
    studentName: zod_1.z.string({ message: 'Имя ученика должно быть строкой.' }).nullable().optional(),
    fullName: zod_1.z.string({ message: 'Имя должно быть строкой.' }).nullable().optional(),
    phone: zod_1.z.string({ message: 'Телефон должен быть строкой.' }).optional(),
    birthday: zod_1.z.coerce.date({ message: 'Дата рождения должна быть в корректном формате' }).nullable().optional(),
    email: zod_1.z.string().email('Некорректный формат email.').optional(),
    role: zod_1.z.enum(['admin', 'manager', 'teacher', 'user']).optional(),
    password: zod_1.z.string().min(8, 'Пароль должен содержать не менее 8 символов.').optional(),
    bonusPoints: zod_1.z.number().int().optional()
});
