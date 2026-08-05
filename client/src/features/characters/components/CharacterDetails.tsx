import type { EnrichedCharacter } from '../types/swapi';
import { formatCreatedDate, formatMass, heightToMeters, normalizeUnknown } from '../utils/formatters';
import { speciesTheme } from '../utils/speciesTheme';
import { HomeworldDetails } from './HomeworldDetails';

export function CharacterDetails({ character }: { character: EnrichedCharacter }) {
  const theme = speciesTheme(character.speciesName);
  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-400">Height</dt>
          <dd className={`font-semibold ${theme.accent}`}>{heightToMeters(character.person.height)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Mass</dt>
          <dd className="font-semibold text-slate-100">{formatMass(character.person.mass)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Birth year</dt>
          <dd className="font-semibold text-slate-100">{normalizeUnknown(character.person.birth_year)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Added to SWAPI</dt>
          <dd className="font-semibold text-slate-100">{formatCreatedDate(character.person.created)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Films</dt>
          <dd className="font-semibold text-slate-100">
            Appears in {character.person.films.length} {character.person.films.length === 1 ? 'film' : 'films'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Species</dt>
          <dd className="font-semibold text-slate-100">{character.speciesName}</dd>
        </div>
      </dl>
      <HomeworldDetails homeworldUrl={character.person.homeworld} />
    </div>
  );
}
