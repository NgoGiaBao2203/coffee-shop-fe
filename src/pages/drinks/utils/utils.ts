import type { DrinkItem } from '../types';

/** Finds a drink with the same name in the same shop (trimmed, case-insensitive). */
export function findDrinkByName(
  drinks: readonly DrinkItem[],
  drinkName: string | undefined,
  shopId: string | undefined,
): DrinkItem | undefined {
  const normalizedName = drinkName?.trim().toLowerCase();

  if (!normalizedName) return undefined;

  return drinks.find(
    (drink) =>
      !drink.isDeleted &&
      (!shopId || drink.shopId === shopId) &&
      drink.drinkName.trim().toLowerCase() === normalizedName,
  );
}
