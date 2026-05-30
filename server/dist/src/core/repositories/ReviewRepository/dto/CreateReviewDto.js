"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewSchema = void 0;
const zod_1 = require("zod");
exports.CreateReviewSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, { message: 'Текст отзыва обязателен' }),
    rating: zod_1.z.number().int().min(1).max(5, { message: 'Рейтинг должен быть от 1 до 5' }),
    userId: zod_1.z.number().int({ message: 'ID пользователя должен быть целым числом' }),
    courseId: zod_1.z.number().int({ message: 'ID курса должен быть целым числом' }),
});
