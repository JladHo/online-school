import { z } from 'zod';
import { CreateApplicationSchema } from './CreateApplicationDto';

export const UpdateApplicationSchema = CreateApplicationSchema.partial();

export type UpdateApplicationDto = z.infer<typeof UpdateApplicationSchema>;
