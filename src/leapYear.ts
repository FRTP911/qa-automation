export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year) || year <= 0) {
    throw new Error('INVALID_YEAR');
  }
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

