import { expect } from 'vitest';

interface ToPlain {
  toPlain(): unknown;
}

declare module 'vitest' {
  export interface Assertion {
    toEqualPlain<E extends ToPlain>(expected: E | undefined): void;
    toEqualPlain<E extends ToPlain>(expected: readonly E[]): void;
  }
}

expect.extend({
  toEqualPlain(
    received: ToPlain[] | ToPlain | undefined,
    expected: ToPlain[] | ToPlain | undefined,
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
