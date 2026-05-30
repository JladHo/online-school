"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHomeworkSchema = void 0;
const zod_1 = require("zod");
exports.CreateHomeworkSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, { message: 'Описание обязательно' }),
    lessonId: zod_1.z.number().int({ message: 'ID урока должен быть целым числом' }),
});
