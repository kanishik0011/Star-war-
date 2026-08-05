export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-yellow-300/30 bg-yellow-300/10 px-3 py-2 text-sm text-yellow-100">
      <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-300" aria-hidden="true" />
      {label}
    </div>
  );
}
