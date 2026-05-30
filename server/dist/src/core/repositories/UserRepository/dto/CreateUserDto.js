"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    parentName: zod_1.z.string().min(2, { message: 'Имя родителя должно содержать не менее 2 символов' }).nullable().optional(),
    studentName: zod_1.z.string().min(2, { message: 'Имя ученика должно содержать не менее 2 символов' }).nullable().optional(),
    fullName: zod_1.z.string().min(2, { message: 'Имя должно содержать не менее 2 символов' }).nullable().optional(),
    phone: zod_1.z.string().min(1, { message: 'Телефон обязателен' }).regex(/^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/, { message: 'Некорректный формат номера телефона' }),
    email: zod_1.z.email({ message: 'Некорректный формат email' }),
    role: zod_1.z.enum(['admin', 'manager', 'teacher', 'user']).optional(),
    birthday: zod_1.z.coerce.date({ message: "Некорректный формат даты" }).nullable().optional(),
    bonusPoints: zod_1.z.number().int().optional(),
});
