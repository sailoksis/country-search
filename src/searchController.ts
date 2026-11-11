import { debounce } from './debounce';
import { searchCountries } from './searchCountries';

export class SearchController {
  private activeController: AbortController | null = null;

  private readonly debouncedSearch = debounce((query: string) => {
    const controller = new AbortController();

    this.activeController = controller;

    void this.runSearch(query, controller.signal);
  }, 300);

  public setActiveController(controller: AbortController): void {
    this.activeController = controller;
  }

  public setQuery(query: string): void {
    this.cancelActiveRequest();

    if (query.trim() === '') {
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
    try {
      await searchCountries(query, signal);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      throw error;
    }
  }
}
