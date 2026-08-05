import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../lib/logger';
import { ErrorState } from '../feedback/ErrorState';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('React render error', { error, info });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
          <ErrorState
            message="The interface hit an unexpected problem."
            onRetry={() => this.setState({ hasError: false })}
          />
        </main>
      );
    }
    return this.props.children;
  }
}
