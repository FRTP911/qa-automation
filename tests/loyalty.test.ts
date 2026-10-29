import { describe, expect, it } from 'vitest';
import { calcLoyaltyDiscount } from '../src/loyalty';

describe('calcLoyaltyDiscount', () => {
  it.each([-1, -0.01, Number.NaN, Number.POSITIVE_INFINITY])(
    'відхиляє некоректний стаж %s',
    (years) => {
      expect(() => calcLoyaltyDiscount(years)).toThrow(
        'INVALID_EXPERIENCE',
      );
    },
  );
});
