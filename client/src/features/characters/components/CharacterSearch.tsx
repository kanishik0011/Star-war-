import { Search, X } from 'lucide-react';

interface CharacterSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CharacterSearch({ value, onChange }: CharacterSearchProps) {
  return (
    <div className="relative">
      <label htmlFor="character-search" className="sr-only">
        Search characters
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        id="character-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search characters"
        className="w-full rounded-md border border-white/15 bg-slate-950/70 py-2 pl-10 pr-10 text-white outline-none focus:border-yellow-300"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
        >
          <X size={18} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
