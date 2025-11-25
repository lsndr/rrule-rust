import 'vitest';

export interface ToPlain {
  toPlain(): unknown;
}

interface ToEqualPlainMatcher<R> {
  toEqualPlain<E extends ToPlain>(expected: E | undefined): R;
  toEqualPlain<E extends ToPlain>(expected: readonly E[]): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required for declaration merging
  interface Matchers<T = any> extends ToEqualPlainMatcher<T> {}
}
