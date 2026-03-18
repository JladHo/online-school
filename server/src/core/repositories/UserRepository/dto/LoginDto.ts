import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.email('Некорректный формат email.'),
    password: z.string().min(1, 'Пароль не может быть пустым.')
});

export type LoginDto = z.infer<typeof LoginSchema>;
