import { z } from 'zod';

export const CreateHomeworkSubmissionSchema = z.object({
    content: z.string().min(1, { message: 'Содержание обязательно' }),
    score: z.number().nullable().optional(),
    status: z.enum(['pending', 'accepted', 'rejected'], { message: 'Некорректный статус' }).optional().default('pending'),
    teacherComment: z.string().nullable().optional(),
    submittedAt: z.coerce.date().optional(),
    homeworkId: z.number().int({ message: 'ID домашнего задания должен быть целым числом' }),
    studentId: z.number().int({ message: 'ID ученика должен быть целым числом' }),
    checkerId: z.number().int().nullable().optional(),
});

export type CreateHomeworkSubmissionDto = z.infer<typeof CreateHomeworkSubmissionSchema>;
