import { z } from 'zod';

export const CreateModuleSchema = z.object({
    title: z.string().min(1, { message: 'Название обязательно' }),
    description: z.string().optional().nullable(),
    courseId: z.number().int({ message: 'ID курса должен быть целым числом' }),
});

export type CreateModuleDto = z.infer<typeof CreateModuleSchema>;
