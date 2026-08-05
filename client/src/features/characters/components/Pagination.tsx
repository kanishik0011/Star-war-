import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, canPrevious, canNext, onPageChange }: PaginationProps) {
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Character pages">
      <button
        type="button"
        disabled={!canPrevious}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </button>
      <span className="rounded-md bg-white/10 px-3 py-2 text-sm text-slate-200">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
