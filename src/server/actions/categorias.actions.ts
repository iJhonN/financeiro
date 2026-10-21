'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { criarCategoria } from '../repositories/categorias.repository';

const categoriaSchema = z.object({
  nome: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres.'),
  tipo: z.enum(['receita', 'despesa']),
  cor: z.string().optional().default('#3b82f6'),
  icone: z.string().optional().default('tag'),
});

export async function criarCategoriaAction(
  formData: FormData | Record<string, unknown>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Não autorizado. Sessão inválida.' };
  }

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const parsed = categoriaSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await criarCategoria(supabase, {
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath('/');
    revalidatePath('/lancamentos');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao cadastrar categoria.';
    return { error: message };
  }
}