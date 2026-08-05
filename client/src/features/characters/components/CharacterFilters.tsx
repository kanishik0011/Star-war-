import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { CharacterFiltersState } from '../types/swapi';
import { hasActiveFilters } from '../utils/filtering';

interface FilterOptions {
  species: string[];
  film: string[];
  homeworld: string[];
}

interface CharacterFiltersProps {
  filters: CharacterFiltersState;
  options: FilterOptions;
  isPreparing: boolean;
  onFilterChange: (key: keyof CharacterFiltersState, value: string) => void;
  onClearAll: () => void;
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-yellow-300"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CharacterFilters({
  filters,
  options,
  isPreparing,
  onFilterChange,
  onClearAll,
}: CharacterFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const content = (
    <div className="grid gap-4 md:grid-cols-4">
      <SelectControl
        label="Species"
        value={filters.species}
        options={options.species}
        onChange={(value) => onFilterChange('species', value)}
      />
      <SelectControl
        label="Film"
        value={filters.film}
        options={options.film}
        onChange={(value) => onFilterChange('film', value)}
      />
      <SelectControl
        label="Homeworld"
        value={filters.homeworld}
        options={options.homeworld}
        onChange={(value) => onFilterChange('homeworld', value)}
      />
      <div className="flex items-end">
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters(filters)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={16} aria-hidden="true" />
          Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="hidden md:block">{content}</div>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-100 md:hidden"
      >
        <Filter size={16} aria-hidden="true" />
        Filters
      </button>
      {isPreparing ? <p className="mt-3 text-sm text-yellow-100">Preparing filter catalogue...</p> : null}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/80 p-4 backdrop-blur md:hidden">
          <div className="rounded-lg border border-white/15 bg-slate-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <X />
              </button>
            </div>
            {content}
          </div>
        </div>
      ) : null}
    </div>
  );
}
