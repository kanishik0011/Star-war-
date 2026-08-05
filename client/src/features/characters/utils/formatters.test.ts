import { describe, expect, it } from 'vitest';
import { filterCharacters } from './filtering';
import {
  calculatePageCount,
  extractSwapiId,
  formatCreatedDate,
  formatMass,
  formatPopulation,
  getSpeciesName,
  heightToMeters,
  isUnknownValue,
  safePicsumSeed,
} from './formatters';
import { speciesTheme } from './speciesTheme';
import type { EnrichedCharacter } from '../types/swapi';

describe('character utilities', () => {
  it('converts centimetres to metres', () => {
    expect(heightToMeters('172')).toBe('1.72 m');
    expect(heightToMeters('unknown')).toBe('Unknown');
  });

  it('formats mass and population values', () => {
    expect(formatMass('77')).toBe('77 kg');
    expect(formatMass('1,358')).toBe('1,358 kg');
    expect(formatPopulation('2000000000')).toBe('2,000,000,000');
    expect(formatPopulation('unknown')).toBe('Unknown');
  });

  it('formats dates and handles invalid values', () => {
    expect(formatCreatedDate('2014-12-09T13:50:51.644000Z')).toBe('09-12-2014');
    expect(formatCreatedDate('not-a-date')).toBe('Unknown');
  });

  it('extracts SWAPI ids with or without trailing slashes', () => {
    expect(extractSwapiId('https://swapi.dev/api/people/1/')).toBe('1');
    expect(extractSwapiId('https://swapi.dev/api/planets/10')).toBe('10');
  });

  it('handles unknowns, species fallback, themes, seeds, and page counts', () => {
    expect(isUnknownValue('n/a')).toBe(true);
    expect(getSpeciesName(null)).toBe('Human');
    expect(speciesTheme('Human').badge).toContain('sky');
    expect(safePicsumSeed('Luke Skywalker!', 'abc')).toBe('luke-skywalker-abc');
    expect(calculatePageCount(82)).toBe(9);
  });

  it('filters by combined name, species, film and homeworld', () => {
    const characters: EnrichedCharacter[] = [
      {
        speciesName: 'Human',
        homeworldName: 'Tatooine',
        filmTitles: ['A New Hope'],
        person: {
          name: 'Luke Skywalker',
          height: '172',
          mass: '77',
          hair_color: 'blond',
          skin_color: 'fair',
          eye_color: 'blue',
          birth_year: '19BBY',
          gender: 'male',
          homeworld: 'planet',
          films: ['film'],
          species: [],
          vehicles: [],
          starships: [],
          created: '2014-12-09T13:50:51.644000Z',
          edited: '2014-12-20T21:17:56.891000Z',
          url: 'person',
        },
      },
    ];
    expect(
      filterCharacters(characters, 'luk', {
        species: 'Human',
        film: 'A New Hope',
        homeworld: 'Tatooine',
      }),
    ).toHaveLength(1);
  });
});
