import { describe, expect, it, vi } from 'vitest';
import { SearchController } from './searchController';

describe('SearchController', () => {
  it('aborts the active request immediately when the query changes', () => {
    const controller = new SearchController();

    const activeRequest = new AbortController();
    const abortSpy = vi.spyOn(activeRequest, 'abort');

    controller.setActiveController(activeRequest);
    controller.setQuery('spain');

    expect(abortSpy).toHaveBeenCalledOnce();
    expect(activeRequest.signal.aborted).toBe(true);
  });
});
