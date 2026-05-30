"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHomeworkSubmissionSchema = void 0;
const zod_1 = require("zod");
exports.UpdateHomeworkSubmissionSchema = zod_1.z.object({
    content: zod_1.z.string().optional(),
    score: zod_1.z.number().nullable().optional(),
    status: zod_1.z.enum(['pending', 'accepted', 'rejected'], { message: 'Некорректный статус' }).optional(),
    teacherComment: zod_1.z.string().nullable().optional(),
    checkerId: zod_1.z.number().int().nullable().optional(),
});
