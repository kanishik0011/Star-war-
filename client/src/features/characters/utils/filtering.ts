import type { CharacterFiltersState, EnrichedCharacter } from '../types/swapi';

export function hasActiveFilters(filters: CharacterFiltersState): boolean {
  return Boolean(filters.species || filters.film || filters.homeworld);
}

export function filterCharacters(
  characters: EnrichedCharacter[],
  search: string,
  filters: CharacterFiltersState,
): EnrichedCharacter[] {
  const needle = search.trim().toLowerCase();
  return characters.filter((character) => {
    const nameMatches = !needle || character.person.name.toLowerCase().includes(needle);
    const speciesMatches = !filters.species || character.speciesName === filters.species;
    const homeworldMatches = !filters.homeworld || character.homeworldName === filters.homeworld;
    const filmMatches = !filters.film || character.filmTitles.includes(filters.film);
    return nameMatches && speciesMatches && homeworldMatches && filmMatches;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
