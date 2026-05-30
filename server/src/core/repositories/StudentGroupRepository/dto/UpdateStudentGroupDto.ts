import { z } from 'zod';
import { CreateStudentGroupSchema } from './CreateStudentGroupDto';

export const UpdateStudentGroupSchema = CreateStudentGroupSchema.partial();

export type UpdateStudentGroupDto = z.infer<typeof UpdateStudentGroupSchema>;
