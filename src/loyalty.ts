const INVALID_EXPERIENCE = 'INVALID_EXPERIENCE';

export function calcLoyaltyDiscount(years: number): number {
  if (!Number.isFinite(years) || years < 0) {
    throw new Error(INVALID_EXPERIENCE);
  }

  return 0;
}
