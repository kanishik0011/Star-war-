import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { App } from '../../../app/App';
import { server } from '../../../test/server';

const luke = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.dev/api/planets/1/',
  films: [
    'https://swapi.dev/api/films/1/',
    'https://swapi.dev/api/films/2/',
    'https://swapi.dev/api/films/3/',
    'https://swapi.dev/api/films/6/',
  ],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.dev/api/people/1/',
};

const tatooine = {
  name: 'Tatooine',
  rotation_period: '23',
  orbital_period: '304',
  diameter: '10465',
  climate: 'arid',
  gravity: '1 standard',
  terrain: 'desert',
  surface_water: '1',
  population: '200000',
  residents: ['https://swapi.dev/api/people/1/'],
  films: ['https://swapi.dev/api/films/1/'],
  created: '2014-12-09T13:50:49.641000Z',
  edited: '2014-12-20T20:58:18.411000Z',
  url: 'https://swapi.dev/api/planets/1/',
};

function film(id: number, title: string) {
  return {
    title,
    episode_id: id,
    opening_crawl: 'Opening crawl',
    director: 'George Lucas',
    producer: 'Gary Kurtz',
    release_date: '1977-05-25',
    characters: ['https://swapi.dev/api/people/1/'],
    planets: ['https://swapi.dev/api/planets/1/'],
    species: [],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: `https://swapi.dev/api/films/${String(id)}/`,
  };
}

describe('Character explorer modal integration', () => {
  it('opens Luke Skywalker details and renders formatted homeworld data', async () => {
    window.history.pushState({}, '', '/');
    server.use(
      http.post('http://localhost:5000/api/auth/refresh', () =>
        HttpResponse.json({
          user: { id: '1', email: 'demo@starwars.dev', name: 'Demo Explorer' },
          accessToken: 'test-token',
        }),
      ),
      http.get(/https:\/\/[^/]+\/api\/people\/?(\?.*)?$/, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('page')).toBe('1');
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [luke],
        });
      }),
      http.get(/https:\/\/[^/]+\/api\/people\/1\/?$/, () => HttpResponse.json(luke)),
      http.get(/https:\/\/[^/]+\/api\/planets\/1\/?$/, () => HttpResponse.json(tatooine)),
      http.get(/https:\/\/[^/]+\/api\/films\/1\/?$/, () => HttpResponse.json(film(1, 'A New Hope'))),
      http.get(/https:\/\/[^/]+\/api\/films\/2\/?$/, () =>
        HttpResponse.json(film(2, 'The Empire Strikes Back')),
      ),
      http.get(/https:\/\/[^/]+\/api\/films\/3\/?$/, () =>
        HttpResponse.json(film(3, 'Return of the Jedi')),
      ),
      http.get(/https:\/\/[^/]+\/api\/films\/6\/?$/, () =>
        HttpResponse.json(film(6, 'Revenge of the Sith')),
      ),
    );

    render(<App />);

    const card = await screen.findByRole('button', { name: /luke skywalker/i });
    expect(card).toBeInTheDocument();

    await userEvent.click(card);
    const dialog = await screen.findByRole('dialog', { name: /luke skywalker/i });

    expect(within(dialog).getByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(within(dialog).getByText('1.72 m')).toBeInTheDocument();
    expect(within(dialog).getByText('77 kg')).toBeInTheDocument();
    expect(within(dialog).getByText('09-12-2014')).toBeInTheDocument();
    expect(within(dialog).getByText('Appears in 4 films')).toBeInTheDocument();
    expect(await within(dialog).findByText('Tatooine')).toBeInTheDocument();
    expect(within(dialog).getByText('desert')).toBeInTheDocument();
    expect(within(dialog).getByText('arid')).toBeInTheDocument();
    expect(within(dialog).getByText('200,000')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: /close character details/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
