import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Introduza um e-mail válido.'),
  password: z
    .string()
    .min(1, 'A palavra-passe é obrigatória.')
    .max(128, 'A palavra-passe deve ter no máximo 128 caracteres.'),
});

export const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Introduza um e-mail válido.'),
  password: z
    .string()
    .min(12, 'A palavra-passe deve conter pelo menos 12 caracteres.')
    .max(128, 'A palavra-passe deve ter no máximo 128 caracteres.'),
});

export const recuperarSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Introduza um e-mail válido.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CadastroInput = z.infer<typeof cadastroSchema>;
export type RecuperarInput = z.infer<typeof recuperarSchema>;