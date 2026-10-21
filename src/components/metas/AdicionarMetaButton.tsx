'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { NovaMetaModal } from './NovaMetaModal';

export function AdicionarMetaButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <Plus className="h-4 w-4" />
        <span>Nova Meta</span>
      </button>

      <NovaMetaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}