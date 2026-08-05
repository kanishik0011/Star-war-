import { X } from 'lucide-react';
import type { CharacterFiltersState } from '../types/swapi';

interface ActiveFilterChipsProps {
  search: string;
  filters: CharacterFiltersState;
  onSearchClear: () => void;
  onFilterClear: (key: keyof CharacterFiltersState) => void;
}

export function ActiveFilterChips({ search, filters, onSearchClear, onFilterClear }: ActiveFilterChipsProps) {
  const chips = [
    search ? { key: 'search', label: `Search: ${search}`, onClear: onSearchClear } : null,
    filters.species ? { key: 'species', label: `Species: ${filters.species}`, onClear: () => onFilterClear('species') } : null,
    filters.film ? { key: 'film', label: `Film: ${filters.film}`, onClear: () => onFilterClear('film') } : null,
    filters.homeworld
      ? { key: 'homeworld', label: `Homeworld: ${filters.homeworld}`, onClear: () => onFilterClear('homeworld') }
      : null,
  ].filter((chip): chip is { key: string; label: string; onClear: () => void } => Boolean(chip));

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-2 rounded-md bg-yellow-300/15 px-3 py-1 text-sm text-yellow-100">
          {chip.label}
          <button type="button" onClick={chip.onClear} aria-label={`Clear ${chip.label}`}>
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
