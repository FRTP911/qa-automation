import { describe, it, expect } from 'vitest';
import { isLeapYear } from '../src/leapYear';

describe('isLeapYear', () => {
  it('визначає 2024 рік як високосний', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('визначає 2023 рік як невисокосний', () => {
    expect(isLeapYear(2023)).toBe(false);
  });

  it('вважає 2000 рік високосним, бо він кратний 400', () => {
    expect(isLeapYear(2000)).toBe(true);
  });

  it('не вважає 1900 рік високосним, бо він кратний 100, але не 400', () => {
    expect(isLeapYear(1900)).toBe(false);
  });

  it('відхиляє неціле значення', () => {
    expect(() => isLeapYear(2023.5)).toThrow('INVALID_YEAR');
  });

  it('відхиляє нульове значення', () => {
    expect(() => isLeapYear(0)).toThrow('INVALID_YEAR');
  });

  it('відхиляє від’ємне значення', () => {
    expect(() => isLeapYear(-4)).toThrow('INVALID_YEAR');
  });
});
