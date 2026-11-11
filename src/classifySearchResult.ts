export type SearchResultStatus = 'cancelled' | 'timeout' | 'error' | 'empty' | 'success';

export function classifySearchResult(result: unknown[] | null, error: unknown): SearchResultStatus {
  if (error !== null && error !== undefined) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'cancelled';
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return 'timeout';
    }

    return 'error';
  }

  if (result === null || result.length === 0) {
    return 'empty';
  }

  return 'success';
}
