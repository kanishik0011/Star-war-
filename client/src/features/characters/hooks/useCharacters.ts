import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { fetchFilm, fetchPeoplePage, fetchPerson, fetchPlanet, fetchSpecies } from '../api/swapiClient';
import { buildCharacterCatalogue } from '../services/catalogue';
import type { CharacterFiltersState, EnrichedCharacter, SwapiSpecies } from '../types/swapi';
import { calculatePageCount, getSpeciesName } from '../utils/formatters';
import { filterCharacters, paginate } from '../utils/filtering';

const pageSize = 10;

export function usePagedCharacters(page: number, search: string) {
  return useQuery({
    queryKey: ['characters', { page, search }],
    queryFn: ({ signal }) => fetchPeoplePage(page, search, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSpeciesForPeople(people: { species: string[] }[]) {
  const urls = [...new Set(people.flatMap((person) => person.species))];
  return useQueries({
    queries: urls.map((url) => ({
      queryKey: ['species', url],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchSpecies(url, signal),
      staleTime: 1000 * 60 * 60,
    })),
    combine(results) {
      const map = new Map<string, SwapiSpecies>();
      results.forEach((result, index) => {
        const url = urls[index];
        if (url && result.data) map.set(url, result.data);
      });
      return { map, isLoading: results.some((result) => result.isLoading) };
    },
  });
}

export function useHomeworld(url: string | undefined) {
  return useQuery({
    queryKey: ['homeworld', url],
    queryFn: ({ signal }) => fetchPlanet(url ?? '', signal),
    enabled: Boolean(url),
    staleTime: 1000 * 60 * 60,
  });
}

export function useCatalogue() {
  return useQuery({
    queryKey: ['character-catalogue'],
    queryFn: ({ signal }) => buildCharacterCatalogue(signal),
    enabled: true,
    staleTime: 1000 * 60 * 20,
  });
}

export function useCharacterByUrl(url: string | undefined) {
  return useQuery({
    queryKey: ['character', url],
    queryFn: ({ signal }) => fetchPerson(url ?? '', signal),
    enabled: Boolean(url),
  });
}

export function useFilm(url: string) {
  return useQuery({
    queryKey: ['film', url],
    queryFn: ({ signal }) => fetchFilm(url, signal),
    staleTime: 1000 * 60 * 60,
  });
}

export function createVisibleCharacters(input: {
  people: EnrichedCharacter[];
  search: string;
  filters: CharacterFiltersState;
  page: number;
}) {
  const filtered = filterCharacters(input.people, input.search, input.filters);
  return {
    results: paginate(filtered, input.page, pageSize),
    count: filtered.length,
    pageCount: calculatePageCount(filtered.length, pageSize),
  };
}

export function enrichPagedCharacters(
  people: Awaited<ReturnType<typeof fetchPeoplePage>>['results'],
  speciesMap: Map<string, SwapiSpecies>,
): EnrichedCharacter[] {
  return people.map((person) => ({
    person,
    speciesName: getSpeciesName(person.species[0] ? speciesMap.get(person.species[0]) : null),
    filmTitles: [],
  }));
}
