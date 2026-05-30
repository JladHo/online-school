import { z } from 'zod';

export const CreateReviewSchema = z.object({
    text: z.string().min(1, { message: 'Текст отзыва обязателен' }),
    rating: z.number().int().min(1).max(5, { message: 'Рейтинг должен быть от 1 до 5' }),
    userId: z.number().int({ message: 'ID пользователя должен быть целым числом' }),
    courseId: z.number().int({ message: 'ID курса должен быть целым числом' }),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
