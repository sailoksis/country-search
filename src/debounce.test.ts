import { describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  it('calls the function only after the delay', () => {
    vi.useFakeTimers();

    try {
      const callback = vi.fn();
      const debounced = debounce(callback, 300);

      debounced();

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(299);

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);

      expect(callback).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
  it('resets the timer when called again', () => {
    vi.useFakeTimers();

    try {
      const callback = vi.fn();
      const debounced = debounce(callback, 300);

      debounced();

      vi.advanceTimersByTime(200);

      debounced();

      vi.advanceTimersByTime(299);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('passes the latest arguments to the callback', () => {
    vi.useFakeTimers();

    try {
      const callback = vi.fn((value: string) => value);
      const debounced = debounce(callback, 300);

      debounced('France');
      debounced('Spain');

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith('Spain');
    } finally {
      vi.useRealTimers();
    }
  });
});
