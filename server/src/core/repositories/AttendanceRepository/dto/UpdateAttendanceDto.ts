import { z } from 'zod';
import { CreateAttendanceSchema } from './CreateAttendanceDto';

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

export type UpdateAttendanceDto = z.infer<typeof UpdateAttendanceSchema>;
