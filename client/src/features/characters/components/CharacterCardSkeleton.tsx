export function CharacterCardSkeleton() {
  return (
    <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/10">
      <div className="h-44 rounded-t-lg bg-white/10" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="h-4 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  );
}
