import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CharacterFiltersState } from '../types/swapi';

export function useCharacterQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const search = searchParams.get('search') ?? '';
  const species = searchParams.get('species') ?? '';
  const film = searchParams.get('film') ?? '';
  const homeworld = searchParams.get('homeworld') ?? '';
  const filters: CharacterFiltersState = useMemo(
    () => ({ species, film, homeworld }),
    [film, homeworld, species],
  );

  const updateParams = useMemo(
    () => ({
      setPage(nextPage: number) {
        setSearchParams((current) => {
          current.set('page', String(Math.max(1, nextPage)));
          return current;
        });
      },
      setSearch(nextSearch: string) {
        setSearchParams((current) => {
          if (nextSearch) current.set('search', nextSearch);
          else current.delete('search');
          current.set('page', '1');
          return current;
        });
      },
      setFilter(key: keyof CharacterFiltersState, value: string) {
        setSearchParams((current) => {
          if (value) current.set(key, value);
          else current.delete(key);
          current.set('page', '1');
          return current;
        });
      },
      clearAll() {
        setSearchParams((current) => {
          current.delete('search');
          current.delete('species');
          current.delete('film');
          current.delete('homeworld');
          current.set('page', '1');
          return current;
        });
      },
    }),
    [setSearchParams],
  );

  return useMemo(
    () => ({ page, search, filters, ...updateParams }),
    [filters, page, search, updateParams],
  );
}
