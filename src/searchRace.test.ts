import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchController } from './searchController';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SearchController race condition', () => {
  it('aborts the old request and shows only the latest result', async () => {
    vi.useFakeTimers();

    const requests: Array<{
      resolve: (response: Response) => void;
      signal: AbortSignal;
      onAbort: ReturnType<typeof vi.fn>;
    }> = [];

    const fetchMock = vi.fn(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise<Response>((resolve, reject) => {
          const onAbort = vi.fn(() => {
            reject(new DOMException('Aborted', 'AbortError'));
          });

          options.signal.addEventListener('abort', onAbort, {
            once: true,
          });

          requests.push({
            resolve,
            signal: options.signal,
            onAbort,
          });
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const states: string[] = [];
    const results: unknown[][] = [];

    const controller = new SearchController((state) => {
      states.push(state.status);

      if (state.status === 'success') {
        results.push(state.countries);
      }
    });

    // Первый запрос
    controller.setQuery('sp');
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Новый ввод должен немедленно отменить старый запрос
    controller.setQuery('spain');

    expect(requests[0].signal.aborted).toBe(true);
    expect(requests[0].onAbort).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requests[1].signal.aborted).toBe(false);

    // Новый запрос завершается первым
    requests[1].resolve(
      new Response(JSON.stringify([{ name: 'Spain' }]), {
        status: 200,
      }),
    );

    await vi.waitFor(() => {
      expect(states.at(-1)).toBe('success');
    });

    expect(results).toEqual([[{ name: 'Spain' }]]);

    // Старый запрос пытается завершиться позже.
    // Его Promise уже отклонён через AbortError.
    requests[0].resolve(
      new Response(JSON.stringify([{ name: 'Old result' }]), {
        status: 200,
      }),
    );

    await Promise.resolve();

    // Старый результат не появился, ошибка отмены не показана
    expect(results).toEqual([[{ name: 'Spain' }]]);
    expect(states).toEqual(['loading', 'loading', 'success']);
  });
});
