/* eslint-disable import/no-default-export -- Required by Jest */
import type { JestConfigWithTsJest } from 'ts-jest';

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
} satisfies JestConfigWithTsJest;
/* eslint-enable import/no-default-export -- Required by Jest */
