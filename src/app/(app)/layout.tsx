import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';

// Desativa o pré-render instantâneo, permitindo a leitura dinâmica de cookies no Next.js 16
export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Confirma a renderização dinâmica em tempo de requisição
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defesa em profundidade: redireciona caso o proxy não intercepte
  if (!user) {
    redirect('/login');
  }

  // Consulta se o membro tem assinatura ativa ou período trial válido
  const { data: assinaturaAtiva } = await supabase.rpc('fn_tem_assinatura_ativa', {
    p_user_id: user.id,
  });

  return (
    <AppShell>
      {assinaturaAtiva === false && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
          O seu período de utilização expirou. A sua conta está em modo de apenas leitura.
        </div>
      )}
      {children}
    </AppShell>
  );
}