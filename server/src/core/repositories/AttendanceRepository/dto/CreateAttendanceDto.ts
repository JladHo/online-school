import { z } from 'zod';

export const CreateAttendanceSchema = z.object({
    isPresent: z.boolean({ message: 'Статус присутствия обязателен' }),
    sessionId: z.number().int({ message: 'ID занятия должен быть целым числом' }),
    studentId: z.number().int({ message: 'ID ученика должен быть целым числом' }),
});

export type CreateAttendanceDto = z.infer<typeof CreateAttendanceSchema>;
