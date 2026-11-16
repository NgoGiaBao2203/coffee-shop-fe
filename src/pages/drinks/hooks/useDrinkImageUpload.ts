import { useCallback } from 'react';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { DRINK_IMAGE_ACCEPT, getDrinkImageError } from '../constants';

// Props for the drink image <Upload>: only .jpg / .png up to 5MB.
// An invalid file is rejected with a toast and never reaches the file list.
// `beforeUpload` returns false for a valid file so antd keeps it local (sent with the form).
export function useDrinkImageUpload(): Pick<UploadProps, 'accept' | 'beforeUpload'> {
  const toast = useToast();
  const { t } = useTranslation();

  const beforeUpload = useCallback<NonNullable<UploadProps['beforeUpload']>>(
    (file) => {
      const error = getDrinkImageError(file);

      if (!error) return false;

      toast.error(t(`drinks.${error}`));
      return Upload.LIST_IGNORE;
    },
    [toast, t],
  );

  return { accept: DRINK_IMAGE_ACCEPT, beforeUpload };
}
