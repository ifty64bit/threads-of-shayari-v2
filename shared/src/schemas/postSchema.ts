import { z } from 'zod/v4';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
export type CreatePostSchemaType = z.infer<typeof createPostSchema>;
