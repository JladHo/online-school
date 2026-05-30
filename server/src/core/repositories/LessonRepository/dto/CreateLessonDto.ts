import { z } from 'zod';

export const CreateLessonSchema = z.object({
    title: z.string().min(1, { message: 'Название обязательно' }),
    description: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    orderNumber: z.number().int({ message: 'Порядковый номер должен быть целым числом' }),
    moduleId: z.number().int({ message: 'ID модуля должен быть целым числом' }),
});

export type CreateLessonDto = z.infer<typeof CreateLessonSchema>;
