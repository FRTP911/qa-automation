const INVALID_EXPERIENCE = 'INVALID_EXPERIENCE';
const FIRST_TIER_START = 1;
const FIRST_TIER_RATE = 5;
const SECOND_TIER_START = 3;
const SECOND_TIER_RATE = 10;

function assertValidExperience(years: number): void {
  if (!Number.isFinite(years) || years < 0) {
    throw new Error(INVALID_EXPERIENCE);
  }
}

export function calcLoyaltyDiscount(years: number): number {
  assertValidExperience(years);

  if (years < FIRST_TIER_START) return 0;
  if (years < SECOND_TIER_START) return FIRST_TIER_RATE;

  return SECOND_TIER_RATE;
}
