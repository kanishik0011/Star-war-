import type { EnrichedCharacter, SwapiFilm, SwapiPerson, SwapiPlanet, SwapiSpecies } from '../types/swapi';
import { getSpeciesName } from '../utils/formatters';
import { fetchFilm, fetchPeoplePage, fetchPlanet, fetchSpecies } from '../api/swapiClient';

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex] as T);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function fetchAllCharacters(signal?: AbortSignal): Promise<SwapiPerson[]> {
  const first = await fetchPeoplePage(1, '', signal);
  const totalPages = Math.ceil(first.count / 10);
  const remainingPages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
  const pages = await mapLimit(remainingPages, 3, (page) => fetchPeoplePage(page, '', signal));
  return [first, ...pages].flatMap((page) => page.results);
}

export async function buildCharacterCatalogue(signal?: AbortSignal): Promise<EnrichedCharacter[]> {
  const people = await fetchAllCharacters(signal);
  const speciesUrls = [...new Set(people.flatMap((person) => person.species))];
  const planetUrls = [...new Set(people.map((person) => person.homeworld).filter(Boolean))];
  const filmUrls = [...new Set(people.flatMap((person) => person.films))];

  const speciesEntries = await mapLimit(speciesUrls, 4, async (url): Promise<[string, SwapiSpecies]> => [
    url,
    await fetchSpecies(url, signal),
  ]);
  const planetEntries = await mapLimit(planetUrls, 4, async (url): Promise<[string, SwapiPlanet]> => [
    url,
    await fetchPlanet(url, signal),
  ]);
  const filmEntries = await mapLimit(filmUrls, 4, async (url): Promise<[string, SwapiFilm]> => [
    url,
    await fetchFilm(url, signal),
  ]);

  const speciesMap = new Map(speciesEntries);
  const planetMap = new Map(planetEntries);
  const filmMap = new Map(filmEntries);

  return people.map((person) => {
    const homeworldName = planetMap.get(person.homeworld)?.name;
    const character: EnrichedCharacter = {
      person,
      speciesName: getSpeciesName(person.species[0] ? speciesMap.get(person.species[0]) : null),
      filmTitles: person.films
        .map((url) => filmMap.get(url)?.title)
        .filter((title): title is string => Boolean(title)),
    };
    if (homeworldName) character.homeworldName = homeworldName;
    return character;
  });
}
