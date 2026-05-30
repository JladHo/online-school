import { z } from 'zod';

export const CreateCourseSchema = z.object({
    title: z.string().min(1, { message: 'Название обязательно' }),
    description: z.string().min(1, { message: 'Описание обязательно' }),
    ageCategory: z.string().min(1, { message: 'Возрастная категория обязательна' }),
    price: z.number().min(0, { message: 'Цена должна быть неотрицательной' }),
});

export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
