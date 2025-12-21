/**
 * Test utilities and helpers
 * Add common test helpers, fixtures, and utilities here
 */

/**
 * Creates a test suite helper for consistent testing patterns
 */
export function createTestHelper() {
  // Add common test utilities here
  return {
    // Example: Mock data generators
    generateRandomString: (length: number = 10): string => {
      return Math.random().toString(36).substring(2, length + 2);
    },
    
    generateRandomNumber: (min: number = 0, max: number = 100): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    generateRandomArray: <T>(length: number, generator: () => T): T[] => {
      return Array.from({ length }, generator);
    },
  };
}

/**
 * Common test fixtures
 */
export const fixtures = {
  strings: {
    empty: '',
    simple: 'hello',
    withSpaces: 'hello world',
    withSpecialChars: 'hello@world!',
    multiLine: 'hello\nworld',
    unicode: 'hello 世界 🌍',
  },
  
  numbers: {
    zero: 0,
    positive: 42,
    negative: -42,
    decimal: 3.14,
    large: Number.MAX_SAFE_INTEGER,
    small: Number.MIN_SAFE_INTEGER,
  },
  
  arrays: {
    empty: [],
    singleItem: [1],
    multiple: [1, 2, 3, 4, 5],
    mixed: [1, 'two', { three: 3 }],
  },
};

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Asserts that a function throws a specific error
   */
  expectThrowsError: (fn: () => void, expectedMessage: string) => {
    let error: Error | undefined;
    try {
      fn();
    } catch (e) {
      error = e as Error;
    }
    if (!error) {
      throw new Error('Expected function to throw an error');
    }
    if (!error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message to include "${expectedMessage}", but got "${error.message}"`
      );
    }
  },
};
