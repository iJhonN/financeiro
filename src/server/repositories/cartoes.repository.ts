import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Cartao = Database['public']['Tables']['cartoes']['Row'];
type CartaoInsert = Database['public']['Tables']['cartoes']['Insert'];

export async function listarCartoes(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('cartoes')
    .select('*')
    .eq('user_id', userId)
    .order('apelido', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar cartões: ${error.message}`);
  }

  return data as Cartao[];
}

export async function criarCartao(
  supabase: SupabaseClient<Database>,
  dados: CartaoInsert
) {
  const { data, error } = await supabase
    .from('cartoes')
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar cartão: ${error.message}`);
  }

  return data as Cartao;
}