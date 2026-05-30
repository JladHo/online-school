"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateModuleSchema = void 0;
const zod_1 = require("zod");
exports.CreateModuleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: 'Название обязательно' }),
    description: zod_1.z.string().optional().nullable(),
    courseId: zod_1.z.number().int({ message: 'ID курса должен быть целым числом' }),
});
