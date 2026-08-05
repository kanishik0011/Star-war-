import bcrypt from 'bcrypt';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

const app = createApp();

interface AuthBody {
  user: { email: string; name: string };
  accessToken: string;
}

async function createDemoUser() {
  return User.create({
    name: 'Demo Explorer',
    email: 'demo@starwars.dev',
    passwordHash: await bcrypt.hash('Falcon123!', 10),
    role: 'user',
  });
}

describe('API health', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', service: 'star-wars-character-explorer' });
  });
});

describe('auth flow', () => {
  it('logs in, refreshes, reads me, and logs out', async () => {
    await createDemoUser();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@starwars.dev', password: 'Falcon123!' })
      .expect(200);

    const loginBody = login.body as AuthBody;
    expect(loginBody.user.email).toBe('demo@starwars.dev');
    expect(loginBody.accessToken).toEqual(expect.any(String));
    const cookies = login.headers['set-cookie'];
    expect(Array.isArray(cookies) ? cookies[0] : cookies).toContain('refreshToken=');
    const cookieHeader = Array.isArray(cookies) ? cookies : [String(cookies)];

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);
    const meBody = me.body as AuthBody;
    expect(meBody.user.name).toBe('Demo Explorer');

    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader)
      .expect(200);
    const refreshedBody = refreshed.body as AuthBody;
    expect(refreshedBody.accessToken).toEqual(expect.any(String));

    const refreshedCookies = refreshed.headers['set-cookie'];
    const refreshedCookieHeader = Array.isArray(refreshedCookies)
      ? refreshedCookies
      : [String(refreshedCookies)];
    await request(app).post('/api/auth/logout').set('Cookie', refreshedCookieHeader).expect(204);
  });

  it('rejects invalid credentials', async () => {
    await createDemoUser();
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@starwars.dev', password: 'Wrong123!' })
      .expect(401);
  });

  it('rejects missing input and protected me without a token', async () => {
    await request(app).post('/api/auth/login').send({ email: 'bad' }).expect(400);
    await request(app).get('/api/auth/me').expect(401);
  });

  it('rejects refresh without cookie', async () => {
    await request(app).post('/api/auth/refresh').expect(401);
  });
});
