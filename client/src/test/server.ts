import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.post('http://localhost:5000/api/auth/refresh', () =>
    HttpResponse.json({ message: 'Refresh token missing' }, { status: 401 }),
  ),
);
