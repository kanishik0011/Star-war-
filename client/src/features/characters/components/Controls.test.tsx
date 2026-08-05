import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { CharacterSearch } from './CharacterSearch';
import { Pagination } from './Pagination';

describe('controls', () => {
  it('updates search input', async () => {
    const onChange = vi.fn();
    render(<CharacterSearch value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/search characters/i), 'luke');
    expect(onChange).toHaveBeenCalled();
  });

  it('triggers pagination navigation', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} canPrevious canNext onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it('invokes error retry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Nope" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
