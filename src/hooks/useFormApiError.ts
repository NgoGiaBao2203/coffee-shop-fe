import { useCallback } from 'react';
import axios from 'axios';
import type { FormInstance } from 'antd';
import { useToast } from '@/components/toast/useToast';
import { RESPONSE_CODE } from '@/constants/messages';
import { getApiErrorMessage, getApiFieldErrors } from '@/utils/apiError';

// Show an API error on a form: field errors under the inputs, otherwise a toast.
// Only codes in the request's `suppressCodes` are handled here, the interceptor shows the others.
export function useFormApiError() {
  const toast = useToast();

  return useCallback(
    (error: unknown, form: FormInstance) => {
      if (!axios.isAxiosError(error)) return;

      const code = error.response?.data?.code ?? RESPONSE_CODE.INTERNAL_SERVER_ERROR;
      if (!(error.config?.suppressCodes ?? []).includes(code)) return;

      const fieldErrors = getApiFieldErrors(error);

      if (fieldErrors.length > 0) {
        form.setFields(fieldErrors);
      } else {
        toast.error(getApiErrorMessage(error));
      }
    },
    [toast],
  );
}
