"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAttendanceSchema = void 0;
const zod_1 = require("zod");
exports.CreateAttendanceSchema = zod_1.z.object({
    isPresent: zod_1.z.boolean({ message: 'Статус присутствия обязателен' }),
    sessionId: zod_1.z.number().int({ message: 'ID занятия должен быть целым числом' }),
    studentId: zod_1.z.number().int({ message: 'ID ученика должен быть целым числом' }),
});
