import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Conta = Database['public']['Tables']['contas']['Row'];
type ContaInsert = Database['public']['Tables']['contas']['Insert'];

export async function listarContas(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('contas')
    .select('*')
    .eq('user_id', userId)
    .order('nome', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar contas: ${error.message}`);
  }

  return data as Conta[];
}

export async function criarConta(
  supabase: SupabaseClient<Database>,
  dados: ContaInsert
) {
  const { data, error } = await supabase
    .from('contas')
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar conta: ${error.message}`);
  }

  return data as Conta;
}