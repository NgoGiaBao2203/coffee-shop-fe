// Supported drink sizes on the frontend
export const DRINK_SIZES = ['S', 'M', 'L'] as const;

// Drink size type generated from supported size values
export type DrinkSize = (typeof DRINK_SIZES)[number];

// Default size used when creating a new drink
export const DEFAULT_DRINK_SIZE: DrinkSize = 'M';

// Status sent in requests: 1 = on sale, 0 = not on sale
export const DRINK_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const;

// Status label returned by the API for a drink on sale ("Ngừng bán" / "Không xác định" otherwise)
const DRINK_ACTIVE_LABEL = 'Đang bán';

export function isDrinkActive(status: unknown): boolean {
  return status === DRINK_STATUS.ACTIVE || status === DRINK_ACTIVE_LABEL;
}

// Drink image rules of the backend (it renames, resizes to 800px and converts to .jpg itself)
export const DRINK_IMAGE_EXTENSIONS = ['.jpg', '.png'] as const;
export const DRINK_IMAGE_ACCEPT = DRINK_IMAGE_EXTENSIONS.join(',');
export const DRINK_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

// vn.json key (under `drinks.`) of the first rule the file breaks, or null when it is valid
export function getDrinkImageError(file: {
  name: string;
  size: number;
}): 'imageTypeInvalid' | 'imageTooLarge' | null {
  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex === -1 ? '' : file.name.slice(dotIndex).toLowerCase();

  if (!(DRINK_IMAGE_EXTENSIONS as readonly string[]).includes(extension)) return 'imageTypeInvalid';
  if (file.size > DRINK_IMAGE_MAX_SIZE) return 'imageTooLarge';

  return null;
}
