import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { EnrichedCharacter } from '../types/swapi';
import { safePicsumSeed } from '../utils/formatters';
import { sessionSeed } from '../utils/sessionSeed';
import { speciesTheme } from '../utils/speciesTheme';

interface CharacterCardProps {
  character: EnrichedCharacter;
  onOpen: (character: EnrichedCharacter, trigger: HTMLButtonElement) => void;
}

export function CharacterCard({ character, onOpen }: CharacterCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const reduceMotion = useReducedMotion();
  const theme = speciesTheme(character.speciesName);
  const seed = safePicsumSeed(character.person.name, sessionSeed);
  const buttonMotion = reduceMotion ? {} : { whileHover: { y: -6, scale: 1.02 }, whileFocus: { y: -4 } };
  const imageMotion = reduceMotion ? {} : { whileHover: { scale: 1.06 } };

  return (
    <motion.button
      type="button"
      layout
      {...buttonMotion}
      onClick={(event) => onOpen(character, event.currentTarget)}
      className={`group overflow-hidden rounded-lg border bg-gradient-to-br ${theme.border} ${theme.background} text-left shadow-lg outline-none transition focus:ring-2 focus:ring-yellow-300`}
    >
      <div className="relative h-44 overflow-hidden bg-slate-900">
        {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-white/10" /> : null}
        <motion.img
          src={`https://picsum.photos/seed/${seed}/600/400`}
          alt=""
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:opacity-100"
          {...imageMotion}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-white">{character.person.name}</h3>
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${theme.badge}`}>
            {character.speciesName}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div>
            <dt className="text-slate-500">Birth year</dt>
            <dd>{character.person.birth_year}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Films</dt>
            <dd>{character.person.films.length}</dd>
          </div>
        </dl>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-yellow-200">
          View details
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  );
}
