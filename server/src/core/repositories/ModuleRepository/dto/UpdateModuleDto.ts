import { z } from 'zod';
import { CreateModuleSchema } from './CreateModuleDto';

export const UpdateModuleSchema = CreateModuleSchema.partial();

export type UpdateModuleDto = z.infer<typeof UpdateModuleSchema>;
