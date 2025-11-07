/**
 * Example Unit Test
 * Demonstrates TDD approach required by constitution
 */

import { describe, it, expect } from 'vitest';

// Example function to test
function add(a: number, b: number): number {
  return a + b;
}

describe('Example Unit Test', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
    expect(add(-5, -3)).toBe(-8);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
    expect(add(0, 0)).toBe(0);
  });
});
