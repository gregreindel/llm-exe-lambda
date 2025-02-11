const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: [
    "<rootDir>/source"
  ],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "<rootDir>/source/{clients,handlers,utils}/**/*.ts",
    "!**/types/**",
  ],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/",
    }),
  },
  setupFilesAfterEnv: [],
  setupFiles: [],
  globals: {},
  testTimeout: 20000,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { },
    ],
  },
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "test-results", outputName: "report.xml" },
    ],
  ],
};
