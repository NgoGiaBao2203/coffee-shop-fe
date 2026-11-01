import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface SubmitButtonsProps {
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  // Submit button text, defaults to "Save"
  readonly submitText?: ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
}

// Cancel + submit buttons, used as a modal or drawer footer
export function SubmitButtons({
  onCancel,
  onSubmit,
  submitText,
  loading = false,
  disabled = false,
}: SubmitButtonsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button onClick={onCancel} disabled={loading}>
        {t('form.cancel')}
      </Button>
      <Button type="primary" loading={loading} disabled={disabled} onClick={onSubmit}>
        {submitText ?? t('form.save')}
      </Button>
    </>
  );
}
