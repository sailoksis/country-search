import { describe, it, expect, vi, afterEach } from 'vitest';
import { SearchController } from './searchController';
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('SearchController race condition', () => {
  it('shows only the latest search result', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    const pendingRequests: Array<{
      resolve: (response: Response) => void;
      reject: (error: Error) => void;
      signal: AbortSignal;
    }> = [];

    fetchMock.mockImplementation((_url: string, options: { signal: AbortSignal }) => {
      return new Promise<Response>((resolve, reject) => {
        pendingRequests.push({
          resolve,
          reject,
          signal: options.signal,
        });

        options.signal.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Request aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    const states: string[] = [];
    const results: unknown[][] = [];

    const controller = new SearchController((state) => {
      states.push(state.status);

      if (state.status === 'success') {
        results.push(state.countries);
      }
    });

    expect(controller).toBeDefined();

    controller.setQuery('sp');

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pendingRequests).toHaveLength(1);

    controller.setQuery('spain');

    expect(pendingRequests[0].signal.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pendingRequests).toHaveLength(2);
    expect(pendingRequests[1].signal.aborted).toBe(false);

    pendingRequests[1].resolve(
      new Response(JSON.stringify([{ name: 'Spain' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await vi.waitFor(() => {
      expect(states.at(-1)).toBe('success');
    });
    expect(states).toEqual(['loading', 'loading', 'success']);
    expect(results).toEqual([[{ name: 'Spain' }]]);

    pendingRequests[0].resolve(
      new Response(JSON.stringify([{ name: 'Spain (old result)' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await Promise.resolve();

    expect(results).toEqual([[{ name: 'Spain' }]]);
    expect(states).toEqual(['loading', 'loading', 'success']);
  });
});
