import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().trim()
        .min(3, 'Name must be at least 3 characters')
        .max(35, 'Name too long'),
    email: z.string().trim().toLowerCase().email('Invalid email'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password too long')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[\W_]/, 'Must contain a special character'),
});

export const signinSchema = z.object({
    email:    z.string().trim().toLowerCase().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export const emailSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email'),
});

export const resetPassSchema = z.object({
    token:       z.string().uuid('Invalid token'),
    newPassword: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[\W_]/, 'Must contain a special character'),
});

export const tokenSchema = z.object({
    token: z.string().uuid('Invalid token'),
});