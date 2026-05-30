import { z } from 'zod';

export const CreateApplicationSchema = z.object({
    parentName: z.string().min(2, { message: 'Имя родителя обязательно и должно содержать не менее 2 символов' }),
    studentName: z.string().min(2, { message: 'Имя ученика обязательно и должно содержать не менее 2 символов' }),
    phone: z.string().min(1, { message: 'Телефон обязателен' }).regex(
        /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
        { message: 'Некорректный формат номера телефона' }
    ),
    email: z.string().email({ message: 'Некорректный формат email' }),
    status: z.enum(['new', 'in_progress', 'closed', 'rejected'], { message: 'Некорректный статус' }).optional().default('new'),
    courseId: z.number().int({ message: 'ID курса должен быть целым числом' }),
    managerId: z.number().int().nullable().optional(),
});

export type CreateApplicationDto = z.infer<typeof CreateApplicationSchema>;
