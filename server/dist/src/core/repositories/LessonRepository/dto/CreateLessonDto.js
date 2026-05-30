"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLessonSchema = void 0;
const zod_1 = require("zod");
exports.CreateLessonSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: 'Название обязательно' }),
    description: zod_1.z.string().optional().nullable(),
    content: zod_1.z.string().optional().nullable(),
    orderNumber: zod_1.z.number().int({ message: 'Порядковый номер должен быть целым числом' }),
    moduleId: zod_1.z.number().int({ message: 'ID модуля должен быть целым числом' }),
});
