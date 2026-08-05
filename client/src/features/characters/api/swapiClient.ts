import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import type {
  PaginatedResponse,
  SwapiFilm,
  SwapiPerson,
  SwapiPlanet,
  SwapiSpecies,
} from '../types/swapi';

export const swapiClient = axios.create({
  baseURL: String(import.meta.env.VITE_SWAPI_BASE_URL ?? 'https://swapi.dev/api'),
  timeout: 12000,
});

const personSchema = z.object({
  name: z.string(),
  height: z.string(),
  mass: z.string(),
  hair_color: z.string(),
  skin_color: z.string(),
  eye_color: z.string(),
  birth_year: z.string(),
  gender: z.string(),
  homeworld: z.string(),
  films: z.array(z.string()),
  species: z.array(z.string()),
  vehicles: z.array(z.string()),
  starships: z.array(z.string()),
  created: z.string(),
  edited: z.string(),
  url: z.string(),
});

const planetSchema = z.object({
  name: z.string(),
  rotation_period: z.string(),
  orbital_period: z.string(),
  diameter: z.string(),
  climate: z.string(),
  gravity: z.string(),
  terrain: z.string(),
  surface_water: z.string(),
  population: z.string(),
  residents: z.array(z.string()),
  films: z.array(z.string()),
  created: z.string(),
  edited: z.string(),
  url: z.string(),
});

const speciesSchema = z.object({
  name: z.string(),
  classification: z.string(),
  designation: z.string(),
  average_height: z.string(),
  skin_colors: z.string(),
  hair_colors: z.string(),
  eye_colors: z.string(),
  average_lifespan: z.string(),
  homeworld: z.string().nullable(),
  language: z.string(),
  people: z.array(z.string()),
  films: z.array(z.string()),
  created: z.string(),
  edited: z.string(),
  url: z.string(),
});

const filmSchema = z.object({
  title: z.string(),
  episode_id: z.number(),
  opening_crawl: z.string(),
  director: z.string(),
  producer: z.string(),
  release_date: z.string(),
  characters: z.array(z.string()),
  planets: z.array(z.string()),
  species: z.array(z.string()),
  created: z.string(),
  edited: z.string(),
  url: z.string(),
});

const classicPeoplePageSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(personSchema),
});

const peopleResponseSchema = z.union([classicPeoplePageSchema, z.array(personSchema)]);

function toRelativeUrl(url: string): string {
  if (url.startsWith('http')) {
    const parsed = new URL(url);
    const path = parsed.pathname.startsWith('/api/') ? parsed.pathname.slice(4) : parsed.pathname;
    return `${path}${parsed.search}`;
  }
  return url;
}

function withSignal(signal?: AbortSignal): AxiosRequestConfig {
  return signal ? { signal } : {};
}

export async function fetchPeoplePage(
  page: number,
  search: string,
  signal?: AbortSignal,
): Promise<PaginatedResponse<SwapiPerson>> {
  const response = await swapiClient.get('/people/', {
    params: { page, search: search || undefined },
    ...withSignal(signal),
  });
  const parsed = peopleResponseSchema.parse(response.data);
  if (!Array.isArray(parsed)) {
    return parsed;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const matchingPeople = normalizedSearch
    ? parsed.filter((person) => person.name.toLowerCase().includes(normalizedSearch))
    : parsed;
  const pageSize = 10;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;

  return {
    count: matchingPeople.length,
    previous: safePage > 1 ? `/people/?page=${String(safePage - 1)}` : null,
    next: start + pageSize < matchingPeople.length ? `/people/?page=${String(safePage + 1)}` : null,
    results: matchingPeople.slice(start, start + pageSize),
  };
}

export async function fetchPerson(urlOrId: string, signal?: AbortSignal): Promise<SwapiPerson> {
  const path = /^\d+$/.test(urlOrId) ? `/people/${urlOrId}/` : toRelativeUrl(urlOrId);
  const response = await swapiClient.get(path, withSignal(signal));
  return personSchema.parse(response.data);
}

export async function fetchPlanet(url: string, signal?: AbortSignal): Promise<SwapiPlanet> {
  const response = await swapiClient.get(toRelativeUrl(url), withSignal(signal));
  return planetSchema.parse(response.data);
}

export async function fetchSpecies(url: string, signal?: AbortSignal): Promise<SwapiSpecies> {
  const response = await swapiClient.get(toRelativeUrl(url), withSignal(signal));
  return speciesSchema.parse(response.data);
}

export async function fetchFilm(url: string, signal?: AbortSignal): Promise<SwapiFilm> {
  const response = await swapiClient.get(toRelativeUrl(url), withSignal(signal));
  return filmSchema.parse(response.data);
}
