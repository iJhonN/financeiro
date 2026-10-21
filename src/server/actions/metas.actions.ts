'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { criarMeta } from '../repositories/metas.repository';

const metaSchema = z.object({
  nome: z.string().min(2, 'O nome da meta deve ter pelo menos 2 caracteres.'),
  alvo_centavos: z
    .number()
    .int('O valor deve ser em centavos inteiros.')
    .positive('O valor deve ser positivo.'),
  atual_centavos: z.number().int().default(0),
  prazo: z.string().optional().nullable(),
});

const aporteSchema = z.object({
  meta_id: z.string().uuid('ID da meta inválido.'),
  valor_centavos: z
    .number()
    .int('O valor deve ser em centavos inteiros.')
    .positive('O valor do aporte deve ser maior que zero.'),
});

export async function criarMetaAction(
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

  const valorRaw =
    rawData.alvo_centavos ??
    rawData.valor_alvo_centavos ??
    rawData.valor_alvo;

  const alvoCentavos =
    typeof valorRaw === 'string'
      ? parseInt(valorRaw.replace(/\D/g, '') || '0', 10)
      : Number(valorRaw);

  const parsed = metaSchema.safeParse({
    nome: rawData.nome ?? rawData.titulo,
    alvo_centavos: alvoCentavos,
    atual_centavos: 0,
    prazo: rawData.prazo ? String(rawData.prazo) : null,
  });

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await criarMeta(supabase, {
      ...parsed.data,
      user_id: user.id,
    });

    revalidatePath('/metas');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao cadastrar meta.';
    return { error: message };
  }
}

export async function adicionarAporteAction(
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

  const valorRaw = rawData.valor_centavos ?? rawData.valor;
  const valorCentavos =
    typeof valorRaw === 'string'
      ? parseInt(valorRaw.replace(/\D/g, '') || '0', 10)
      : Number(valorRaw);

  const parsed = aporteSchema.safeParse({
    meta_id: rawData.meta_id,
    valor_centavos: valorCentavos,
  });

  if (!parsed.success) {
    return {
      error: 'Dados inválidos.',
      detalhes: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const { data: metaAtual, error: fetchError } = await supabase
      .from('metas')
      .select('atual_centavos, alvo_centavos')
      .eq('id', parsed.data.meta_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !metaAtual) {
      throw new Error('Meta não encontrada ou sem permissão.');
    }

    const novoAtual = (metaAtual.atual_centavos ?? 0) + parsed.data.valor_centavos;
    const concluida = novoAtual >= metaAtual.alvo_centavos;

    const { error: updateError } = await supabase
      .from('metas')
      .update({
        atual_centavos: novoAtual,
        concluida,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.meta_id)
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error(`Erro ao registrar aporte: ${updateError.message}`);
    }

    revalidatePath('/metas');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao processar aporte.';
    return { error: message };
  }
}