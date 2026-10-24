import axios from 'axios';
import type { FormInstance } from 'antd';
import { RESPONSE_CODE } from '@/constants/messages';

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
