import axios from 'axios';
import type { FormInstance } from 'antd';
import { RESPONSE_CODE } from '@/constants/messages';

/** Maps drink-name conflict responses to the drink name field in the form. */
export function setDrinkNameConflictError(error: unknown, form: FormInstance, message: string) {
  if (!axios.isAxiosError(error)) return;

  const response = error.response?.data;
  const errorDetails: { errorCode?: string }[] = Array.isArray(response?.errorDetails)
    ? response.errorDetails
    : [];
  const isNameConflict =
    response?.code === RESPONSE_CODE.CONFLICT ||
    response?.code === 'ER011' ||
    errorDetails.some(
      ({ errorCode }) => errorCode === RESPONSE_CODE.CONFLICT || errorCode === 'ER011',
    );

  if (isNameConflict) {
    form.setFields([{ name: 'drinkName', errors: [message] }]);
  }
}
