import { LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-yellow-300">
          Star Wars Character Explorer
        </a>
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="hidden sm:inline">{user?.name}</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-slate-100 hover:bg-white/10"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
