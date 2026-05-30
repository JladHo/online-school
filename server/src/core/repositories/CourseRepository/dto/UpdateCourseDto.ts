import { z } from 'zod';
import { CreateCourseSchema } from './CreateCourseDto';

export const UpdateCourseSchema = CreateCourseSchema.partial();

export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
