import { z } from 'zod';
import { CreateHomeworkSchema } from './CreateHomeworkDto';

export const UpdateHomeworkSchema = CreateHomeworkSchema.partial();

export type UpdateHomeworkDto = z.infer<typeof UpdateHomeworkSchema>;
