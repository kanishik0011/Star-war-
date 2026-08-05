import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { EnrichedCharacter } from '../types/swapi';
import { speciesTheme } from '../utils/speciesTheme';
import { CharacterDetails } from './CharacterDetails';

interface CharacterModalProps {
  character: EnrichedCharacter;
  trigger: HTMLButtonElement | null;
  onClose: () => void;
}

export function CharacterModal({ character, trigger, onClose }: CharacterModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const theme = speciesTheme(character.speciesName);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeButton = dialogRef.current?.querySelector<HTMLButtonElement>('button');
    closeButton?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [trigger]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-modal-title"
        className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-lg border ${theme.border} bg-slate-950 p-5 shadow-2xl sm:rounded-lg sm:p-6`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${theme.accent}`}>
              {character.speciesName}
            </p>
            <h2 id="character-modal-title" className="mt-1 text-3xl font-bold text-white">
              {character.person.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close character details"
            className="rounded-md border border-white/15 p-2 text-slate-100 hover:bg-white/10"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <CharacterDetails character={character} />
      </div>
    </div>,
    document.body,
  );
}
