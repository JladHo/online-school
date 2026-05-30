import { z } from 'zod';
import { CreatePurchaseSchema } from './CreatePurchaseDto';

export const UpdatePurchaseSchema = CreatePurchaseSchema.partial();

export type UpdatePurchaseDto = z.infer<typeof UpdatePurchaseSchema>;
