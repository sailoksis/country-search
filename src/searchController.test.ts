import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchController } from './searchController';

describe('SearchController', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('aborts the active request immediately when the query changes', () => {
    const controller = new SearchController();

    const activeRequest = new AbortController();
    const abortSpy = vi.spyOn(activeRequest, 'abort');

    controller.setActiveController(activeRequest);
    controller.setQuery('spain');

    expect(abortSpy).toHaveBeenCalledOnce();
    expect(activeRequest.signal.aborted).toBe(true);
  });

  it('aborts a running fetch before the next debounce finishes', async () => {
    vi.useFakeTimers();

    const signals: AbortSignal[] = [];

    const fetchMock = vi.fn((_url: string, options: { signal: AbortSignal }) => {
      signals.push(options.signal);

      return new Promise<Response>((_resolve, reject) => {
        options.signal.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Request aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new SearchController();

    controller.setQuery('sp');

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(signals[0]?.aborted).toBe(false);

    controller.setQuery('spain');

    expect(signals[0]?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not start a fetch when the input is cleared before debounce finishes', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const controller = new SearchController();

    controller.setQuery('spain');

    await vi.advanceTimersByTimeAsync(100);

    controller.setQuery('');

    await vi.advanceTimersByTimeAsync(500);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports loading and success when countries are found', async () => {
    vi.useFakeTimers();

    const countries = [{ name: 'Spain' }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => countries,
    });

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = new SearchController(onStateChange);

    controller.setQuery('spain');

    await vi.advanceTimersByTimeAsync(300);

    expect(onStateChange).toHaveBeenCalledWith({
      status: 'loading',
    });

    expect(onStateChange).toHaveBeenCalledWith({
      status: 'success',
      countries,
    });
  });

  it('reports empty when no countries are found', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const onStateChange = vi.fn();
    const controller = new SearchController(onStateChange);

    controller.setQuery('unknowncountry');

    await vi.advanceTimersByTimeAsync(300);

    expect(onStateChange).toHaveBeenCalledWith({
      status: 'loading',
    });

    expect(onStateChange).toHaveBeenCalledWith({
      status: 'empty',
    });

    expect(onStateChange).not.toHaveBeenCalledWith(expect.objectContaining({ status: 'error' }));
  });
});
