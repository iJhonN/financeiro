'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { criarCartao } from '../repositories/cartoes.repository';

const cartaoSchema = z.object({
  apelido: z.string().min(2, 'O apelido do cartão deve ter pelo menos 2 caracteres.'),
  banco_slug: z.string().min(1, 'O banco é obrigatório.').default('outro'),
  limite_centavos: z
    .number()
    .int('O limite deve ser em centavos inteiros.')
    .nonnegative('O limite não pode ser negativo.')
    .default(0),
  dia_fechamento: z.number().int().min(1).max(31),
  dia_vencimento: z.number().int().min(1).max(31),
});

export async function criarCartaoAction(
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

  const limiteRaw = rawData.limite_centavos ?? rawData.limite ?? 0;
  const limiteCentavos =
    typeof limiteRaw === 'string'
      ? parseInt(limiteRaw.replace(/\D/g, '') || '0', 10)
      : Number(limiteRaw);

  const parsed = cartaoSchema.safeParse({
    ...rawData,
    apelido: rawData.apelido ?? rawData.nome,
    limite_centavos: limiteCentavos,
    dia_fechamento: Number(rawData.dia_fechamento),
    dia_vencimento: Number(rawData.dia_vencimento),
  });

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await criarCartao(supabase, {
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath('/');
    revalidatePath('/cartoes');
    revalidatePath('/lancamentos');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao cadastrar cartão de crédito.';
    return { error: message };
  }
}