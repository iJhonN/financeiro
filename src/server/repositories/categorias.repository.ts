import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Categoria = Database['public']['Tables']['categorias']['Row'];
type CategoriaInsert = Database['public']['Tables']['categorias']['Insert'];

export async function listarCategorias(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('nome', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar categorias: ${error.message}`);
  }

  return data as Categoria[];
}

export async function criarCategoria(
  supabase: SupabaseClient<Database>,
  dados: CategoriaInsert
) {
  const { data, error } = await supabase
    .from('categorias')
    .insert(dados)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar categoria: ${error.message}`);
  }

  return data as Categoria;
}