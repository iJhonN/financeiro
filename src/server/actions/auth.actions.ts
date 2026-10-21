'use server';

import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  cadastroSchema,
  recuperarSchema,
} from '@/lib/validators/auth.schema';
import { redirect } from 'next/navigation';

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
};

/**
 * Autenticação por e-mail e senha.
 * Retorna mensagem genérica para impedir enumeração de contas (security.md).
 */
export async function loginAction(formData: unknown): Promise<AuthActionResult> {
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  redirect('/');
}

/**
 * Registo de novo membro.
 * Exige confirmação de e-mail antes do primeiro acesso (security.md).
 * O perfil e registros iniciais são gerados pelo trigger tr_on_user_created (bancodedados.md).
 */
export async function cadastroAction(formData: unknown): Promise<AuthActionResult> {
  const result = cadastroSchema.safeParse(formData);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return { error: firstIssue ? firstIssue.message : 'Dados inválidos.' };
  }

  const { nome, email, password } = result.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, requiresEmailConfirmation: true };
}

/**
 * Solicitação de redefinição de senha.
 * Responde sempre de forma neutra para evitar enumeração de contas (security.md).
 */
export async function recuperarSenhaAction(formData: unknown): Promise<AuthActionResult> {
  const result = recuperarSchema.safeParse(formData);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return { error: firstIssue ? firstIssue.message : 'E-mail inválido.' };
  }

  const { email } = result.data;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Executa o disparo sem revelar se o e-mail existe na base de dados
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/perfil`,
  });

  return { success: true };
}

/**
 * Encerramento de sessão com invalidação de cookies HttpOnly.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}