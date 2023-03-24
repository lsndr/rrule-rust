/* eslint-disable import/no-default-export -- Required by jest */
import { Config } from 'jest';

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          keepClassNames: true,
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
} satisfies Config;
