import { z } from 'zod';

export const CreateGroupSchema = z.object({
    name: z.string().min(1, { message: 'Название обязательно' }),
    type: z.enum(['individual', 'group'], { message: 'Некорректный тип группы' }).optional().default('group'),
    courseId: z.number().int({ message: 'ID курса должен быть целым числом' }),
    teacherId: z.number().int().nullable().optional(),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
