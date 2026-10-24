// Supported drink sizes on the frontend
export const DRINK_SIZES = ['S', 'M', 'L'] as const;

// Drink size type generated from supported size values
export type DrinkSize = (typeof DRINK_SIZES)[number];

// Default size used when creating a new drink
export const DEFAULT_DRINK_SIZE: DrinkSize = 'M';
