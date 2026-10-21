import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Meta = Database['public']['Tables']['metas']['Row'];
type MetaInsert = Database['public']['Tables']['metas']['Insert'];

export async function listarMetas(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('metas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar metas: ${error.message}`);
  }

  return data as Meta[];
}

export async function criarMeta(
  supabase: SupabaseClient<Database>,
  dados: MetaInsert
) {
  const { data, error } = await supabase
    .from('metas')
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar meta: ${error.message}`);
  }

  return data as Meta;
}