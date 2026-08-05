import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useHomeworld } from '../hooks/useCharacters';
import { formatPopulation, normalizeUnknown } from '../utils/formatters';

export function HomeworldDetails({ homeworldUrl }: { homeworldUrl: string }) {
  const query = useHomeworld(homeworldUrl);

  if (query.isLoading) {
    return <LoadingIndicator label="Loading homeworld..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Homeworld details could not be loaded."
        technicalDetails={query.error instanceof Error ? query.error.message : undefined}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) return null;

  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="text-lg font-bold text-white">Homeworld</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-400">Planet</dt>
          <dd className="font-medium text-slate-100">{query.data.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Terrain</dt>
          <dd className="font-medium text-slate-100">{normalizeUnknown(query.data.terrain)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Climate</dt>
          <dd className="font-medium text-slate-100">{normalizeUnknown(query.data.climate)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-400">Population</dt>
          <dd className="font-medium text-slate-100">{formatPopulation(query.data.population)}</dd>
        </div>
      </dl>
    </section>
  );
}
