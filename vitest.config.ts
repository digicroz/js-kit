import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Enable globals (optional - allows using describe, it, expect without imports)
    globals: true,

    // Test environment (node is default, use 'jsdom' if you need browser APIs)
    environment: "node",

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.ts",
        "**/*.d.ts",
        "**/index.ts", // Usually just re-exports
        "src/types/**", // Type definitions
      ],
      // Set coverage thresholds (adjust as needed)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Include test files
    include: ["tests/**/*.{test,spec}.{js,ts}", "src/**/*.{test,spec}.{js,ts}"],

    // Exclude files
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],

    // Watch mode options for incremental testing
    watch: true,

    // Pool options for parallel test execution
    pool: "threads",

    // Test timeout
    testTimeout: 10000,

    // Reporter configuration
    reporters: ["default"],

    // Isolate environment for each test file
    isolate: true,
  },
})
