"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePurchaseSchema = void 0;
const zod_1 = require("zod");
exports.CreatePurchaseSchema = zod_1.z.object({
    purchasePrice: zod_1.z.number().min(0, { message: 'Цена должна быть неотрицательной' }),
    purchaseAt: zod_1.z.coerce.date().optional(),
    userId: zod_1.z.number().int({ message: 'ID пользователя должен быть целым числом' }),
    courseId: zod_1.z.number().int({ message: 'ID курса должен быть целым числом' }).nullable().optional(),
});
