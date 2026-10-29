const INVALID_EXPERIENCE = 'INVALID_EXPERIENCE';

function assertValidExperience(years: number): void {
  if (!Number.isFinite(years) || years < 0) {
    throw new Error(INVALID_EXPERIENCE);
  }
}

export function calcLoyaltyDiscount(years: number): number {
  assertValidExperience(years);

  return 0;
}
