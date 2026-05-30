import { z } from 'zod';
import { CreateReviewSchema } from './CreateReviewDto';

export const UpdateReviewSchema = CreateReviewSchema.partial();

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
