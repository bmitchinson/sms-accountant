import { returnBen } from '../src/utils/returnBen';
import { test, expect } from 'bun:test';

const result = returnBen();

test('returnBen() returns "ben"', () => {
    expect(result).not.toBe('ben');
    expect(result).toBe('Ben');
});
