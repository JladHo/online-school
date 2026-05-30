"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHomeworkSubmissionSchema = void 0;
const zod_1 = require("zod");
exports.CreateHomeworkSubmissionSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, { message: 'Содержание обязательно' }),
    score: zod_1.z.number().nullable().optional(),
    status: zod_1.z.enum(['pending', 'accepted', 'rejected'], { message: 'Некорректный статус' }).optional().default('pending'),
    teacherComment: zod_1.z.string().nullable().optional(),
    submittedAt: zod_1.z.coerce.date().optional(),
    homeworkId: zod_1.z.number().int({ message: 'ID домашнего задания должен быть целым числом' }),
    studentId: zod_1.z.number().int({ message: 'ID ученика должен быть целым числом' }),
    checkerId: zod_1.z.number().int().nullable().optional(),
});
