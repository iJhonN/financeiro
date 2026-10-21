import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { endOfMonth, format, parse } from 'date-fns';

type Transacao = Database['public']['Tables']['transacoes']['Row'];
type TransacaoInsert = Database['public']['Tables']['transacoes']['Insert'];

export async function listarTransacoesMes(
  supabase: SupabaseClient<Database>,
  userId: string,
  mesReferencia: string // Formato: YYYY-MM
) {
  const dataReferencia = parse(mesReferencia, 'yyyy-MM', new Date());
  const startDate = `${mesReferencia}-01`;
  const endDate = format(endOfMonth(dataReferencia), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .eq('user_id', userId)
    .gte('data_competencia', startDate)
    .lte('data_competencia', endDate)
    .order('data_competencia', { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar transações: ${error.message}`);
  }

  return data as Transacao[];
}

export async function criarTransacao(
  supabase: SupabaseClient<Database>,
  dados: TransacaoInsert
) {
  const { data, error } = await supabase
    .from('transacoes')
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar transação: ${error.message}`);
  }

  return data as Transacao;
}

export async function excluirTransacao(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  const { error } = await supabase
    .from('transacoes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Erro ao excluir transação: ${error.message}`);
  }

  return true;
}