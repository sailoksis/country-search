export type Debounced<T extends (...args: never[]) => void> = T & {
  cancel: () => void;
};

export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): Debounced<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, delay);
  };

  const cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return Object.assign(debounced, { cancel }) as Debounced<T>;
}
