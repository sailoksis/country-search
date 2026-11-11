import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from './searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches countries by name', async () => {
    const countries = [{ name: 'France' }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => countries,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('france', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/france',
      expect.objectContaining({
        signal: controller.signal,
      }),
    );

    expect(result).toEqual(countries);
  });

  it('returns an empty array when the server responds with 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('unknown-country', controller.signal);

    expect(result).toEqual([]);
  });
  it('rejects with an HTTP error containing status 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('france', controller.signal)).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });
});
