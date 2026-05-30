"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStudentGroupSchema = void 0;
const zod_1 = require("zod");
exports.CreateStudentGroupSchema = zod_1.z.object({
    studentId: zod_1.z.number().int({ message: 'ID ученика должен быть целым числом' }),
    groupId: zod_1.z.number().int({ message: 'ID группы должен быть целым числом' }),
});
