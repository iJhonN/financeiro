'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { MonthPicker } from './MonthPicker';

export function Header() {
  const [ocultarSaldos, setOcultarSaldos] = useState(false);

  function togglePrivacidade() {
    setOcultarSaldos((prev) => !prev);
    // Dispara evento global para componentes filhos esconderem valores com blur
    window.dispatchEvent(new CustomEvent('toggle-privacidade-saldos'));
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-base font-semibold tracking-tight text-[var(--text)]">
          Wolf<span className="text-[var(--primary)]">.</span>
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <MonthPicker />
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={togglePrivacidade}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[var(--text)] active:scale-[0.98] transition-colors"
          aria-label={ocultarSaldos ? 'Exibir saldos' : 'Ocultar saldos'}
        >
          {ocultarSaldos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}