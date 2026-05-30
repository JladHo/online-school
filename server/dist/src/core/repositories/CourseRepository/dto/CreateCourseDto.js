"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCourseSchema = void 0;
const zod_1 = require("zod");
exports.CreateCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: 'Название обязательно' }),
    description: zod_1.z.string().min(1, { message: 'Описание обязательно' }),
    ageCategory: zod_1.z.string().min(1, { message: 'Возрастная категория обязательна' }),
    price: zod_1.z.number().min(0, { message: 'Цена должна быть неотрицательной' }),
});
