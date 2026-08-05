import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CharacterCard } from './CharacterCard';
import type { EnrichedCharacter } from '../types/swapi';

const character: EnrichedCharacter = {
  speciesName: 'Human',
  filmTitles: [],
  person: {
    name: 'Leia Organa',
    height: '150',
    mass: '49',
    hair_color: 'brown',
    skin_color: 'light',
    eye_color: 'brown',
    birth_year: '19BBY',
    gender: 'female',
    homeworld: 'https://swapi.dev/api/planets/2/',
    films: ['https://swapi.dev/api/films/1/'],
    species: [],
    vehicles: [],
    starships: [],
    created: '2014-12-10T15:20:09.791000Z',
    edited: '2014-12-20T21:17:50.315000Z',
    url: 'https://swapi.dev/api/people/5/',
  },
};

describe('CharacterCard', () => {
  it('renders name and species and opens on click', async () => {
    const onOpen = vi.fn();
    render(<CharacterCard character={character} onOpen={onOpen} />);
    expect(screen.getByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument();
    expect(screen.getByText('Human')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /leia organa/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
