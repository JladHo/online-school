import { z } from 'zod';

export const CreateHomeworkSchema = z.object({
    description: z.string().min(1, { message: 'Описание обязательно' }),
    lessonId: z.number().int({ message: 'ID урока должен быть целым числом' }),
});

export type CreateHomeworkDto = z.infer<typeof CreateHomeworkSchema>;
