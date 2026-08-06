import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('validates invalid email input', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    );
    await userEvent.clear(screen.getByLabelText(/email/i));
    await userEvent.type(screen.getByLabelText(/email/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('allows visitors to continue as a guest', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: /continue as guest/i }));

    expect(window.localStorage.getItem('swapi-field-guide-guest-session')).toBe('true');
  });
});
