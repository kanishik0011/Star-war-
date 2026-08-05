import { RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  technicalDetails?: string | undefined;
  onRetry?: () => void;
}

export function ErrorState({ message, technicalDetails, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-md border border-red-300/30 bg-red-950/40 p-4 text-red-50">
      <p className="font-semibold">{message}</p>
      {import.meta.env.DEV && technicalDetails ? (
        <pre className="mt-2 whitespace-pre-wrap text-xs text-red-100/80">{technicalDetails}</pre>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200/40 px-3 py-2 text-sm font-medium text-red-50 hover:bg-red-200/10"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
