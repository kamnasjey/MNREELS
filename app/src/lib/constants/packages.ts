// Tasalbar package definitions (bank transfer only)
export const TASALBAR_PACKAGES = [
  { id: "pkg-20", name: "Турших", amount: 20, priceMNT: 1000 },
  { id: "pkg-65", name: "Жижиг", amount: 65, priceMNT: 2500, bonus: 5 },
  { id: "pkg-135", name: "Дунд", amount: 135, priceMNT: 5000, bonus: 10, popular: true },
  { id: "pkg-290", name: "Том", amount: 290, priceMNT: 10000, bonus: 20 },
  { id: "pkg-600", name: "Супер", amount: 600, priceMNT: 18000, bonus: 50 },
] as const;

export type TasalbarPackage = (typeof TASALBAR_PACKAGES)[number];

export function getPackageById(id: string) {
  return TASALBAR_PACKAGES.find((p) => p.id === id);
}

// Pricing
export const PRICE_PER_TASALBAR = 50;
export const MIN_TASALBAR = 100;

// Bank details
export const BANK_NAME = "Хаан банк";
export const BANK_ACCOUNT = "5013221055";
export const BANK_ACCOUNT_NAME = "Зоригт Ариунжаргал";
export const BANK_IBAN = "85000500";

// Revenue split
export const CREATOR_SHARE_PERCENT = 0.80;
export const PLATFORM_SHARE_PERCENT = 0.20;

// Access durations (ms)
export const EPISODE_ACCESS_HOURS = 48;
export const BUNDLE_ACCESS_HOURS = 96;
export const EPISODE_ACCESS_MS = EPISODE_ACCESS_HOURS * 60 * 60 * 1000;
export const BUNDLE_ACCESS_MS = BUNDLE_ACCESS_HOURS * 60 * 60 * 1000;
