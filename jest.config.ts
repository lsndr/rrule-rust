/* eslint-disable import/no-default-export -- Required by jest */
import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

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
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>',
  }),
} satisfies JestConfigWithTsJest;
