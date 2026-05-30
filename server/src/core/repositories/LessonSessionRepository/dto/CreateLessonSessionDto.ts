import { z } from 'zod';

export const CreateLessonSessionSchema = z.object({
    scheduledAt: z.coerce.date({ message: 'Дата и время обязательны' }),
    durationMin: z.number().int().min(1, { message: 'Продолжительность должна быть больше 0' }),
    meetingLink: z.string().nullable().optional(),
    lessonId: z.number().int({ message: 'ID урока должен быть целым числом' }),
    groupId: z.number().int({ message: 'ID группы должен быть целым числом' }),
    teacherId: z.number().int({ message: 'ID преподавателя должен быть целым числом' }),
});

export type CreateLessonSessionDto = z.infer<typeof CreateLessonSessionSchema>;
