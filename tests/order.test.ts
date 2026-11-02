import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  splitPayment,
  type OrderItem,
} from '../src/order';
 
const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});
 
describe('calcSubtotal', () => {

  it('підсумовує вартість позицій з урахуванням кількості', () => {
    // Arrange
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];

    // Act
    const result = calcSubtotal(items);

    // Assert
    expect(result).toBe(350);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {

  it.each([
    { tier: 'basic' as const,  subtotal: 500,  expected: 0 },
    { tier: 'silver' as const, subtotal: 500,  expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 500,  expected: 0.1 },
    { tier: 'basic' as const,  subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const,   subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1))
      .toThrow('INVALID_PROMO');
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});
 
describe('calcOrderTotal', () => {

  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    // 1200 − 10 % = 1080 ≥ 1000, доставка безкоштовна
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });

  it('знижка може опустити суму нижче порога доставки', () => {
    // 1050 − 10 % = 945 < 1000, тому доставка платна
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });

  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('splitPayment', () => {
  it.each([
    { total: 100, parts: 3, expected: [33.33, 33.33, 33.34] },
    { total: 10, parts: 2, expected: [5, 5] },
    { total: 1, parts: 4, expected: [0.25, 0.25, 0.25, 0.25] },
  ])('розбиває $total на $parts частин з точною сумою', ({ total, parts, expected }) => {
    const result = splitPayment(total, parts);
    expect(result).toEqual(expected);
    expect(result.reduce((sum, v) => sum + v, 0)).toBeCloseTo(total, 2);
  });

  it.each([
    [1, 1, [1]],
    [0, 3, [0, 0, 0]],
    [2000, 2000, Array(2000).fill(1)],
  ])('межа/нульові значення: total=%i parts=%i', (total, parts, expected) => {
    const result = splitPayment(total, parts);
    expect(result).toEqual(expected);
    expect(result.reduce((sum, v) => sum + v, 0)).toBeCloseTo(total, 2);
  });

  it.each([
    [-0.01, 2],
    [-5, 1],
  ])('відхиляє некоректний total %s через INVALID_TOTAL', (total, parts) => {
    expect(() => splitPayment(total, parts)).toThrowError(new Error('INVALID_TOTAL'));
  });

  it.each([
    [100, 0],
    [100, -1],
    [100, -5],
    [100, 1.5],
    [100, 2.3],
  ])('відхиляє некоректні parts %s через INVALID_PARTS', (total, parts) => {
    expect(() => splitPayment(total, parts)).toThrowError(new Error('INVALID_PARTS'));
  });

  it('кількість частин parts-1 менше за межу (граничне 0)', () => {
    expect(() => splitPayment(100, 0)).toThrowError(new Error('INVALID_PARTS'));
  });

  it('частина parts на межі допустимого (рівна 1)', () => {
    const result = splitPayment(123.45, 1);
    expect(result).toEqual([123.45]);
    expect(result.reduce((sum, v) => sum + v, 0)).toBeCloseTo(123.45, 2);
  });

  it('частина parts на межі плюс один (рівна 2)', () => {
    const result = splitPayment(123.45, 2);
    expect(result).toEqual([61.72, 61.73]);
    expect(result.reduce((sum, v) => sum + v, 0)).toBeCloseTo(123.45, 2);
  });
});
