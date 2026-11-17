import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from './mapCountryResponse';

describe('mapCountryResponse', () => {
  it('maps country API data to card data', () => {
    const raw = {
      name: 'France',
      flag: '🇫🇷',
      capital: 'Paris',
      region: 'Europe',
      population: 68000000,
      languages: [{ name: 'French' }],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'France',
      flag: '🇫🇷',
      capital: 'Paris',
      region: 'Europe',
      population: 68000000,
      languages: ['French'],
    });
  });
  it('maps multiple languages', () => {
    const raw = {
      name: 'Switzerland',
      flag: '🇨🇭',
      capital: 'Bern',
      region: 'Europe',
      population: 9000000,
      languages: [{ name: 'German' }, { name: 'French' }, { name: 'Italian' }],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Switzerland',
      flag: '🇨🇭',
      capital: 'Bern',
      region: 'Europe',
      population: 9000000,
      languages: ['German', 'French', 'Italian'],
    });
  });

  it('handles an empty languages array', () => {
    const raw = {
      name: 'Test Country',
      flag: '🏳️',
      capital: 'Test Capital',
      region: 'Test Region',
      population: 1000,
      languages: [],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Test Country',
      flag: '🏳️',
      capital: 'Test Capital',
      region: 'Test Region',
      population: 1000,
      languages: [],
    });
  });
});
