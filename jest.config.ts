/* eslint-disable import/no-default-export -- Required by jest */
import { Config } from 'jest';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
} satisfies Config;
