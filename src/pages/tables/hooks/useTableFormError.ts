import { useCallback } from 'react';
import { notification, type FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { getTableFormApiError } from '../utils/utils';

/** Applies backend errors to the table form or shows a general notification. */
export function useTableFormError(form: FormInstance) {
  const { t } = useTranslation();

  return useCallback(
    (error: unknown) => {
      const { fieldErrors, message } = getTableFormApiError(error, t('tables.numberConflict'));

      if (fieldErrors.length > 0) {
        form.setFields(fieldErrors);
      }

      if (message) {
        notification.error({
          message: t('common.error'),
          description: message,
          placement: 'topRight',
          duration: 3,
        });
      }
    },
    [form, t],
  );
}
