import { z } from 'zod/v4';

export const registerSchema = z.object({
    name: z.string().min(3, 'Name is required'),
    username: z.string().min(3, 'Username is required'),
    email: z
        .email({ message: 'Invalid email address' })
        .min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z
        .email({ message: 'Invalid email address' })
        .min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;
