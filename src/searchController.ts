import { debounce } from './debounce';
import { searchCountries } from './searchCountries';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; countries: unknown[] }
  | { status: 'empty' }
  | { status: 'error'; error: unknown };

export type SearchStateListener = (state: SearchState) => void;

export class SearchController {
  private readonly onStateChange: SearchStateListener;
  private activeController: AbortController | null = null;

  constructor(onStateChange: SearchStateListener = () => {}) {
    this.onStateChange = onStateChange;
  }

  private readonly debouncedSearch = debounce((query: string) => {
    const controller = new AbortController();

    this.activeController = controller;

    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]);

    void this.runSearch(query, signal);
  }, 300);

  public setActiveController(controller: AbortController): void {
    this.activeController = controller;
  }

  public setQuery(query: string): void {
    this.debouncedSearch.cancel();
    this.cancelActiveRequest();

    if (query.trim() === '') {
      this.onStateChange({ status: 'idle' });
      return;
    }

    this.debouncedSearch(query);
  }

  private cancelActiveRequest(): void {
    if (this.activeController !== null) {
      this.activeController.abort();
      this.activeController = null;
    }
  }

  private async runSearch(query: string, signal: AbortSignal): Promise<void> {
    this.onStateChange({ status: 'loading' });

    try {
      const countries = await searchCountries(query, signal);

      if (signal.aborted) {
        return;
      }

      if (countries.length === 0) {
        this.onStateChange({ status: 'empty' });
        return;
      }

      this.onStateChange({
        status: 'success',
        countries,
      });
    } catch (error: unknown) {
      if (signal.aborted && signal.reason?.name === 'AbortError') {
        return;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      this.onStateChange({
        status: 'error',
        error,
      });
    }
  }
}
