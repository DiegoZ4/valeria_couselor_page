import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

export const sessionSchema = z.object({
  startTime: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, 'La fecha debe ser futura'),
  endTime: z.string().optional().refine((val) => {
    if (!val) return true; // Allow empty endTime
    const date = new Date(val);
    return date > new Date();
  }, 'La fecha debe ser futura'),
  details: z.string().optional(),
  observations: z.string().optional(),
}).refine((data) => {
  if (data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  }
  return true; // If no endTime provided, validation passes
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime'],
});

export const updateSessionSchema = z.object({
  id: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  details: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  }
  return true;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime'],
});

export const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
