import axios from 'axios';
import type { FormInstance } from 'antd';
import { RESPONSE_CODE } from '@/constants/messages';
import type { DrinkItem } from '../types';

const DRINK_SIZE_EXISTS_MESSAGE = 'drink size already exists';

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

/** Checks whether the API rejected the request because the drink already has this size. */
export function isDrinkSizeExistsError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  const message = error.response?.data?.message;

  return (
    error.response?.data?.code === RESPONSE_CODE.INVALID_REQUEST &&
    typeof message === 'string' &&
    message.trim().toLowerCase() === DRINK_SIZE_EXISTS_MESSAGE
  );
}

/** Shows the duplicated-size error on the size field of the form. */
export function setDrinkSizeExistsError(error: unknown, form: FormInstance, message: string) {
  if (!isDrinkSizeExistsError(error)) return;

  form.setFields([{ name: 'size', errors: [message] }]);
}

/** Maps drink-name conflict responses to the drink name field in the form. */
export function setDrinkNameConflictError(error: unknown, form: FormInstance, message: string) {
  // Ignore non-Axios errors
  if (!axios.isAxiosError(error)) return;

  const response = error.response?.data;

  // Read validation error details from API response
  const errorDetails: { errorCode?: string }[] = Array.isArray(response?.errorDetails)
    ? response.errorDetails
    : [];

  // Check whether the response contains a drink name conflict
  const isNameConflict =
    response?.code === RESPONSE_CODE.CONFLICT ||
    response?.code === 'ER011' ||
    errorDetails.some(
      ({ errorCode }) => errorCode === RESPONSE_CODE.CONFLICT || errorCode === 'ER011',
    );

  // Show conflict message directly on the drink name field
  if (isNameConflict) {
    form.setFields([
      {
        name: 'drinkName',
        errors: [message],
      },
    ]);
  }
}
