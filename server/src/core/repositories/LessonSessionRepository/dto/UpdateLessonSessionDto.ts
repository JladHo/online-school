import { z } from 'zod';
import { CreateLessonSessionSchema } from './CreateLessonSessionDto';

export const UpdateLessonSessionSchema = CreateLessonSessionSchema.partial();

export type UpdateLessonSessionDto = z.infer<typeof UpdateLessonSessionSchema>;
