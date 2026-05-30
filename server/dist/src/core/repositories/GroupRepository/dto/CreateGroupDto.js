"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupSchema = void 0;
const zod_1 = require("zod");
exports.CreateGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: 'Название обязательно' }),
    type: zod_1.z.enum(['individual', 'group'], { message: 'Некорректный тип группы' }).optional().default('group'),
    courseId: zod_1.z.number().int({ message: 'ID курса должен быть целым числом' }),
    teacherId: zod_1.z.number().int().nullable().optional(),
});
