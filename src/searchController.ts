export class SearchController {
  private activeController: AbortController | null = null;

  public setActiveController(controller: AbortController): void {
    this.activeController = controller;
  }

  public setQuery(query: string): void {
    void query;
    this.cancelActiveRequest();
  }

  private cancelActiveRequest(): void {
    if (this.activeController !== null) {
      this.activeController.abort();
      this.activeController = null;
    }
  }
}
