import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['CLIENT', 'FREELANCER'], {
    errorMap: () => ({ message: "Role must be either 'CLIENT' or 'FREELANCER'" }),
  }),
  companyName: z.string().optional(),
  title: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  otp: z.string().optional(),
});

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'Verification code is required').max(10),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
