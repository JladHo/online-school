import { z } from 'zod';
import { CreateLessonSchema } from './CreateLessonDto';

export const UpdateLessonSchema = CreateLessonSchema.partial();

export type UpdateLessonDto = z.infer<typeof UpdateLessonSchema>;
