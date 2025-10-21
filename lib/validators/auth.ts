import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Informe um email válido.');

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres.')
  .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula.')
  .regex(/[a-z]/, 'Inclua ao menos uma letra minúscula.')
  .regex(/\d/, 'Inclua ao menos um número.');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto.'),
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.boolean().optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.'),
  remember: z.boolean().optional()
});

export const requestResetSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, 'Token inválido.'),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.'
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(8, 'Telefone inválido.')
    .max(20, 'Telefone inválido.')
    .optional()
    .or(z.literal('')),
  timezone: z.string().trim().min(2),
  avatarUrl: z
    .string()
    .url('URL inválida.')
    .optional()
    .or(z.literal(''))
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.'
  });
