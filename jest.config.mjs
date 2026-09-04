import { defineConfig } from "jest";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

export default defineConfig({
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coverageReporters: ["html", "text"],
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage",
  ],
  modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/coverage/"],
});
