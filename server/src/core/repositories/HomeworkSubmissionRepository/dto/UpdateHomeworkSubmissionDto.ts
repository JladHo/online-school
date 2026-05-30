import { z } from 'zod';
import { CreateHomeworkSubmissionSchema } from './CreateHomeworkSubmissionDto';

export const UpdateHomeworkSubmissionSchema = z.object({
    content: z.string().optional(),
    score: z.number().nullable().optional(),
    status: z.enum(['pending', 'accepted', 'rejected'], { message: 'Некорректный статус' }).optional(),
    teacherComment: z.string().nullable().optional(),
    checkerId: z.number().int().nullable().optional(),
});

export type UpdateHomeworkSubmissionDto = z.infer<typeof UpdateHomeworkSubmissionSchema>;
