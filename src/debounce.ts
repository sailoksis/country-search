export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  void fn;
  void delay;

  throw new Error('Not implemented');
}
