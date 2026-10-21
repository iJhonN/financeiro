'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  criarTransacao,
  excluirTransacao,
} from '../repositories/transacoes.repository';

const transacaoSchema = z.object({
  descricao: z.string().min(2, 'A descrição deve ter pelo menos 2 caracteres.'),
  valor_centavos: z
    .number()
    .int('O valor deve ser em centavos inteiros.')
    .positive('O valor deve ser positivo.'),
  tipo: z.enum(['receita', 'despesa']),
  forma: z
    .enum(['pix', 'dinheiro', 'debito', 'credito', 'ted', 'boleto', 'outro'])
    .default('pix'),
  data_competencia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD).'),
  status: z.enum(['pago', 'pendente']).default('pago'),
  conta_id: z.string().uuid().optional().nullable(),
  categoria_id: z.string().uuid().optional().nullable(),
});

export async function criarTransacaoAction(
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

  // Garante a conversão para inteiro em centavos, suportando entrada como "valor" ou "valor_centavos"
  const valorRaw = rawData.valor_centavos ?? rawData.valor;
  const valorCentavos =
    typeof valorRaw === 'string'
      ? parseInt(valorRaw.replace(/\D/g, ''), 10)
      : Number(valorRaw);

  const parsed = transacaoSchema.safeParse({
    ...rawData,
    valor_centavos: valorCentavos,
  });

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await criarTransacao(supabase, {
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath('/');
    revalidatePath('/lancamentos');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro inesperado ao criar a transação.';
    return { error: message };
  }
}

export async function excluirTransacaoAction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Não autorizado. Sessão inválida.' };
  }

  try {
    await excluirTransacao(supabase, id, user.id);

    revalidatePath('/');
    revalidatePath('/lancamentos');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro inesperado ao excluir o lançamento.';
    return { error: message };
  }
}