"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateApplicationSchema = void 0;
const zod_1 = require("zod");
exports.CreateApplicationSchema = zod_1.z.object({
    parentName: zod_1.z.string().min(2, { message: 'Имя родителя обязательно и должно содержать не менее 2 символов' }),
    studentName: zod_1.z.string().min(2, { message: 'Имя ученика обязательно и должно содержать не менее 2 символов' }),
    phone: zod_1.z.string().min(1, { message: 'Телефон обязателен' }).regex(/^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/, { message: 'Некорректный формат номера телефона' }),
    email: zod_1.z.string().email({ message: 'Некорректный формат email' }),
    status: zod_1.z.enum(['new', 'in_progress', 'closed', 'rejected'], { message: 'Некорректный статус' }).optional().default('new'),
    courseId: zod_1.z.number().int({ message: 'ID курса должен быть целым числом' }),
    managerId: zod_1.z.number().int().nullable().optional(),
});
