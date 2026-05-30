import { z } from 'zod';

export const CreateStudentGroupSchema = z.object({
    studentId: z.number().int({ message: 'ID ученика должен быть целым числом' }),
    groupId: z.number().int({ message: 'ID группы должен быть целым числом' }),
});

export type CreateStudentGroupDto = z.infer<typeof CreateStudentGroupSchema>;
