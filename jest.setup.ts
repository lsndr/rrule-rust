import { iterableEquality } from '@jest/expect-utils';

interface ToPlain {
  toPlain(): unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Required for jest
  namespace jest {
    interface Matchers<R> {
      toEqualPlain<E extends ToPlain>(expected: E | undefined): R;
      toEqualPlain<E extends ToPlain>(expected: readonly E[]): R;
    }
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

      pass = this.equals(receivedPlain, expectedPlain, [iterableEquality]);
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
        `Expected plain does not match received plain:\r\n\r\n${this.utils.printDiffOrStringify(expectedPlain, receivedPlain, 'Expected', 'Received', true)}`,
      pass,
    };
  },
});
