import { z } from 'zod';

export const CreateUserSchema = z.object({
    parentName: z.string().min(2, { message: 'Имя родителя обязательно и должно содержать не менее 2 символов' }),
    studentName: z.string().min(2, { message: 'Имя ученика обязательно и должно содержать не менее 2 символов' }),
    phone: z.string().min(1, { message: 'Телефон обязателен' }).regex(
        /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
        { message: 'Некорректный формат номера телефона' }),
    email: z.email({ message: 'Некорректный формат email' }),
    role: z.enum(['admin', 'manager', 'teacher', 'user']).optional(),
    birthday: z.string().datetime({ message: "Некорректный формат даты" }).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
