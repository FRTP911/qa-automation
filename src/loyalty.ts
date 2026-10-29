const INVALID_EXPERIENCE = 'INVALID_EXPERIENCE';
const FIRST_TIER_START = 1;
const FIRST_TIER_RATE = 5;

function assertValidExperience(years: number): void {
  if (!Number.isFinite(years) || years < 0) {
    throw new Error(INVALID_EXPERIENCE);
  }
}

export function calcLoyaltyDiscount(years: number): number {
  assertValidExperience(years);

  if (years < FIRST_TIER_START) return 0;

  return FIRST_TIER_RATE;
}
