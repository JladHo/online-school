import { z } from 'zod';
import { CreateGroupSchema } from './CreateGroupDto';

export const UpdateGroupSchema = CreateGroupSchema.partial();

export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
