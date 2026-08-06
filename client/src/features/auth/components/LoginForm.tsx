import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { normalizeError } from '../../../lib/errors';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginValues } from '../schemas/loginSchema';

export function LoginForm() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@starwars.dev', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(normalizeError(requestError).message);
    }
  });

  const handleGuestAccess = () => {
    setError(null);
    continueAsGuest();
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-white/15 bg-white/10 p-6 shadow-glow backdrop-blur">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-200">Secure access</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Star Wars Character Explorer</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Demo credentials: demo@starwars.dev / Falcon123!
        </p>
      </div>
      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}
      <label className="mt-4 block text-sm font-medium text-slate-200" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        className="mt-2 w-full rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-yellow-300"
        autoComplete="email"
        {...register('email')}
      />
      {errors.email ? <p className="mt-1 text-sm text-red-200">{errors.email.message}</p> : null}
      <label className="mt-4 block text-sm font-medium text-slate-200" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        className="mt-2 w-full rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-yellow-300"
        autoComplete="current-password"
        {...register('password')}
      />
      {errors.password ? <p className="mt-1 text-sm text-red-200">{errors.password.message}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-yellow-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} aria-hidden="true" />
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
      <button
        type="button"
        onClick={handleGuestAccess}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-2 font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300"
      >
        <UserRound size={18} aria-hidden="true" />
        Continue as guest
      </button>
    </form>
  );
}
