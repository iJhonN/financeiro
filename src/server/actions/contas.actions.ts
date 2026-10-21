'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { criarConta } from '../repositories/contas.repository';

const contaSchema = z.object({
  nome: z.string().min(2, 'O nome da conta deve ter pelo menos 2 caracteres.'),
  tipo: z.enum(['corrente', 'poupanca', 'investimento', 'carteira', 'outro']).default('corrente'),
  saldo_inicial_centavos: z.number().int().default(0),
  cor: z.string().optional().default('#3b82f6'),
});

export async function criarContaAction(
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

  const saldoRaw = rawData.saldo_inicial_centavos ?? rawData.saldo_inicial ?? 0;
  const saldoCentavos =
    typeof saldoRaw === 'string'
      ? parseInt(saldoRaw.replace(/\D/g, '') || '0', 10)
      : Number(saldoRaw);

  const parsed = contaSchema.safeParse({
    ...rawData,
    saldo_inicial_centavos: saldoCentavos,
  });

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await criarConta(supabase, {
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath('/');
    revalidatePath('/contas');
    revalidatePath('/lancamentos');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao cadastrar conta bancária.';
    return { error: message };
  }
}