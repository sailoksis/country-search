import { describe, expect, it } from 'vitest';
import { HttpError } from './HttpError';
import { classifySearchResult } from './classifySearchResult';

describe('classifySearchResult', () => {
  it('classifies an aborted request as cancelled', () => {
    const error = new DOMException('Aborted', 'AbortError');

    expect(classifySearchResult(null, error)).toBe('cancelled');
  });

  it('classifies a timeout as an error', () => {
    const error = new DOMException('Timed out', 'TimeoutError');

    expect(classifySearchResult(null, error)).toBe('timeout');
  });

  it('classifies an HTTP error as an error', () => {
    const error = new HttpError(500);

    expect(classifySearchResult(null, error)).toBe('error');
  });

  it('classifies an empty result as empty', () => {
    expect(classifySearchResult([], null)).toBe('empty');
  });

  it('classifies a non-empty result as success', () => {
    expect(classifySearchResult([{ name: 'France' }], null)).toBe('success');
  });

  it('classifies a network failure as an error', () => {
    expect(classifySearchResult(null, new TypeError('Failed to fetch'))).toBe('error');
  });
});
