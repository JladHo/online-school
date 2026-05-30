import { z } from 'zod';

export const CreatePurchaseSchema = z.object({
    purchasePrice: z.number().min(0, { message: 'Цена должна быть неотрицательной' }),
    purchaseAt: z.coerce.date().optional(),
    userId: z.number().int({ message: 'ID пользователя должен быть целым числом' }),
    courseId: z.number().int({ message: 'ID курса должен быть целым числом' }).nullable().optional(),
});

export type CreatePurchaseDto = z.infer<typeof CreatePurchaseSchema>;
