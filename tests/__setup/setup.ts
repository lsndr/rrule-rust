import { expect } from 'vitest';

interface ToPlain {
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

expect.extend({
  toEqualPlain<E extends ToPlain>(
    received: E[] | E | undefined,
    expected: E[] | E | undefined,
  ) {
    let pass = false;
    let expectedPlain: unknown;
    let receivedPlain: unknown;

    if (Array.isArray(received) && Array.isArray(expected)) {
      receivedPlain = received.map((r) => r.toPlain());
      expectedPlain = expected.map((e) => e.toPlain());

      pass = this.equals(receivedPlain, expectedPlain);
    } else if (!Array.isArray(received) && !Array.isArray(expected)) {
      receivedPlain = received?.toPlain();
      expectedPlain = expected?.toPlain();

      pass = this.equals(receivedPlain, expectedPlain);
    } else {
      throw new Error(
        'Both received and expected values must be of the same type, either ToPlain or ToPlain[].',
      );
    }

    return {
      message: () =>
        `Expected plain does not match received plain:\r\n\r\n${this.utils.printDiffOrStringify(receivedPlain, expectedPlain)}`,
      pass,
    };
  },
});
