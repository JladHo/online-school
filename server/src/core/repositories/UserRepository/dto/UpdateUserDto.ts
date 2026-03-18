import { z } from 'zod';

export const UpdateUserSchema = z.object({
    parentName: z.string({ message: 'Имя родителя должно быть строкой.' }).optional(),
    studentName: z.string({ message: 'Имя ученика должно быть строкой.' }).optional(),
    phone: z.string({ message: 'Телефон должен быть строкой.' }).optional(),
    birthday: z.string({ message: 'Дата рождения должна быть в формате ISO' }).datetime().optional(),
    email: z.email('Некорректный формат email.').optional(),
    role: z.enum(['admin', 'manager', 'teacher', 'user']).optional(),
    password: z.string().min(8, 'Пароль должен содержать не менее 8 символов.').optional()
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
