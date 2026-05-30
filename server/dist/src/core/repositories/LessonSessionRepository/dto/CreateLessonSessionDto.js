"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLessonSessionSchema = void 0;
const zod_1 = require("zod");
exports.CreateLessonSessionSchema = zod_1.z.object({
    scheduledAt: zod_1.z.coerce.date({ message: 'Дата и время обязательны' }),
    durationMin: zod_1.z.number().int().min(1, { message: 'Продолжительность должна быть больше 0' }),
    meetingLink: zod_1.z.string().nullable().optional(),
    lessonId: zod_1.z.number().int({ message: 'ID урока должен быть целым числом' }),
    groupId: zod_1.z.number().int({ message: 'ID группы должен быть целым числом' }),
    teacherId: zod_1.z.number().int({ message: 'ID преподавателя должен быть целым числом' }),
});
