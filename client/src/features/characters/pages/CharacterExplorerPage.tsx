import { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveFilterChips } from '../components/ActiveFilterChips';
import { CharacterFilters } from '../components/CharacterFilters';
import { CharacterGrid } from '../components/CharacterGrid';
import { CharacterModal } from '../components/CharacterModal';
import { CharacterSearch } from '../components/CharacterSearch';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { normalizeError } from '../../../lib/errors';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { EnrichedCharacter } from '../types/swapi';
import { calculatePageCount } from '../utils/formatters';
import { hasActiveFilters } from '../utils/filtering';
import {
  createVisibleCharacters,
  enrichPagedCharacters,
  useCatalogue,
  usePagedCharacters,
  useSpeciesForPeople,
} from '../hooks/useCharacters';
import { useCharacterQueryParams } from '../hooks/useCharacterQueryParams';

function uniqueSorted(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function CharacterExplorerPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{ character: EnrichedCharacter; trigger: HTMLButtonElement | null } | null>(
    null,
  );
  const queryParams = useCharacterQueryParams();
  const page = queryParams.page;
  const search = queryParams.search;
  const filters = queryParams.filters;
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const filtersActive = hasActiveFilters(filters);
  const pagedQuery = usePagedCharacters(page, filtersActive ? '' : search);
  const speciesQueries = useSpeciesForPeople(pagedQuery.data?.results ?? []);
  const catalogueQuery = useCatalogue();

  useEffect(() => setSearchInput(search), [search]);

  useEffect(() => {
    if (debouncedSearch !== search) queryParams.setSearch(debouncedSearch);
  }, [debouncedSearch, queryParams, search]);

  const pagedCharacters = useMemo(
    () => enrichPagedCharacters(pagedQuery.data?.results ?? [], speciesQueries.map),
    [pagedQuery.data?.results, speciesQueries.map],
  );

  const catalogueView = useMemo(() => {
    if (!catalogueQuery.data) return { results: [], count: 0, pageCount: 1 };
    return createVisibleCharacters({
      people: catalogueQuery.data,
      search,
      filters,
      page,
    });
  }, [catalogueQuery.data, filters, page, search]);

  const displayedCharacters = filtersActive ? catalogueView.results : pagedCharacters;
  const resultCount = filtersActive ? catalogueView.count : (pagedQuery.data?.count ?? 0);
  const pageCount = filtersActive ? catalogueView.pageCount : calculatePageCount(pagedQuery.data?.count ?? 0);
  const isInitialLoading = filtersActive
    ? catalogueQuery.isLoading
    : pagedQuery.isLoading || speciesQueries.isLoading;
  const isRefetching = pagedQuery.isFetching && !pagedQuery.isLoading;
  const error = filtersActive ? catalogueQuery.error : pagedQuery.error;

  const options = useMemo(
    () => ({
      species: uniqueSorted(catalogueQuery.data?.map((character) => character.speciesName) ?? []),
      film: uniqueSorted(catalogueQuery.data?.flatMap((character) => character.filmTitles) ?? []),
      homeworld: uniqueSorted(catalogueQuery.data?.map((character) => character.homeworldName) ?? []),
    }),
    [catalogueQuery.data],
  );

  function handlePageChange(nextPage: number): void {
    queryParams.setPage(nextPage);
    window.setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="pb-8 pt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-200">SWAPI Field Guide</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold text-white sm:text-5xl">
          Star Wars Character Explorer
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Explore people, species and worlds from a galaxy far, far away.
        </p>
      </section>

      <section className="mb-8 rounded-lg border border-white/10 bg-white/10 p-4 shadow-glow backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <CharacterSearch value={searchInput} onChange={setSearchInput} />
          <CharacterFilters
            filters={filters}
            options={options}
            isPreparing={catalogueQuery.isLoading}
            onFilterChange={(key, value) => queryParams.setFilter(key, value)}
            onClearAll={() => queryParams.clearAll()}
          />
        </div>
        <div className="mt-4">
          <ActiveFilterChips
            search={search}
            filters={filters}
            onSearchClear={() => queryParams.setSearch('')}
            onFilterClear={(key) => queryParams.setFilter(key, '')}
          />
        </div>
      </section>

      <section ref={sectionRef} aria-live="polite">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">
            {resultCount.toLocaleString()} {resultCount === 1 ? 'character' : 'characters'} found
          </p>
          {isRefetching || (filtersActive && catalogueQuery.isFetching && !catalogueQuery.isLoading) ? (
            <LoadingIndicator label="Refreshing results..." />
          ) : null}
        </div>

        {error ? (
          <ErrorState
            message={normalizeError(error).message}
            technicalDetails={normalizeError(error).technicalDetails}
            onRetry={() => {
              if (filtersActive) void catalogueQuery.refetch();
              else void pagedQuery.refetch();
            }}
          />
        ) : null}

        {!error ? (
          displayedCharacters.length ? (
            <>
              <CharacterGrid
                characters={displayedCharacters}
                isLoading={isInitialLoading}
                onOpen={(character, trigger) => setSelected({ character, trigger })}
              />
              <Pagination
                page={page}
                pageCount={pageCount}
                canPrevious={page > 1}
                canNext={page < pageCount}
                onPageChange={handlePageChange}
              />
            </>
          ) : isInitialLoading ? (
            <CharacterGrid characters={[]} isLoading onOpen={() => undefined} />
          ) : (
            <EmptyState message="No characters found." />
          )
        ) : null}
      </section>

      {selected ? (
        <CharacterModal
          character={selected.character}
          trigger={selected.trigger}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </main>
  );
}
