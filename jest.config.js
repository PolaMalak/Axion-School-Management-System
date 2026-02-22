module.exports = {
  testTimeout: 10000,
  testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
  testEnvironment: "node",
  collectCoverageFrom: [
    "managers/entities/**/*.manager.js",
    "managers/token/*.js",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "text-summary"],
};
