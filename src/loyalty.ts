const INVALID_EXPERIENCE = 'INVALID_EXPERIENCE';
const BIRTHDAY_MULTIPLIER = 2;

export interface LoyaltyOptions {
  birthday?: boolean;
}

interface DiscountTier {
  readonly minYears: number;
  readonly rate: number;
}

const DISCOUNT_TIERS: readonly DiscountTier[] = [
  { minYears: 0, rate: 0 },
  { minYears: 1, rate: 5 },
  { minYears: 3, rate: 10 },
  { minYears: 5, rate: 15 },
];

function assertValidExperience(years: number): void {
  if (!Number.isFinite(years) || years < 0) {
    throw new Error(INVALID_EXPERIENCE);
  }
}

function getBaseDiscount(years: number): number {
  let discount = 0;

  for (const tier of DISCOUNT_TIERS) {
    if (years >= tier.minYears) discount = tier.rate;
  }

  return discount;
}

function applyBirthdayBonus(
  discount: number,
  options: LoyaltyOptions,
): number {
  return options.birthday
    ? discount * BIRTHDAY_MULTIPLIER
    : discount;
}

export function calcLoyaltyDiscount(
  years: number,
  options: LoyaltyOptions = {},
): number {
  assertValidExperience(years);

  return applyBirthdayBonus(getBaseDiscount(years), options);
}
