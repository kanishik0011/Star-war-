import axios from 'axios';

export type AppErrorKind = 'network' | 'timeout' | 'unexpected';

export interface AppError {
  kind: AppErrorKind;
  message: string;
  technicalDetails?: string;
}

export function normalizeError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return { kind: 'timeout', message: 'The request timed out. Please try again.' };
    }
    if (!error.response) {
      return { kind: 'network', message: 'Network connection failed. Check your connection.' };
    }
    const responseData: unknown = error.response.data;
    const responseMessage =
      responseData && typeof responseData === 'object' && 'message' in responseData
        ? String((responseData as Record<string, unknown>).message)
        : 'The API returned an unexpected response.';
    return {
      kind: 'unexpected',
      message: responseMessage,
      technicalDetails: error.message,
    };
  }
  return {
    kind: 'unexpected',
    message: 'Something unexpected happened.',
    technicalDetails: error instanceof Error ? error.message : String(error),
  };
}
