import { z } from 'zod';

export const UpdateUserSchema = z.object({
    parentName: z.string({ message: 'Имя родителя должно быть строкой.' }).nullable().optional(),
    studentName: z.string({ message: 'Имя ученика должно быть строкой.' }).nullable().optional(),
    fullName: z.string({ message: 'Имя должно быть строкой.' }).nullable().optional(),
    phone: z.string({ message: 'Телефон должен быть строкой.' }).optional(),
    birthday: z.coerce.date({ message: 'Дата рождения должна быть в корректном формате' }).nullable().optional(),
    email: z.string().email('Некорректный формат email.').optional(),
    role: z.enum(['admin', 'manager', 'teacher', 'user']).optional(),
    password: z.string().min(8, 'Пароль должен содержать не менее 8 символов.').optional(),
    bonusPoints: z.number().int().optional()
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
