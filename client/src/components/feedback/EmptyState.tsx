export function EmptyState({ message = 'No characters found.' }: { message?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-slate-200">
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
}
