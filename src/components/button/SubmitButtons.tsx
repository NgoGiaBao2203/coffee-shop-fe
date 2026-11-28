import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from 'antd';

interface SubmitButtonsProps {
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  // Submit button text, defaults to "Save"
  readonly submitText?: ReactNode;
  // Cancel button text, defaults to "Cancel" (e.g. "Don't print" when it is a second action)
  readonly cancelText?: ReactNode;
  readonly loading?: boolean;
  // Spinner on the cancel button when it runs an action itself
  readonly cancelLoading?: boolean;
  readonly disabled?: boolean;
  // Tooltip on the disabled submit button explaining why it cannot be submitted
  readonly disabledReason?: ReactNode;
  // Show the submit button before Cancel (default: Cancel first)
  readonly submitFirst?: boolean;
}

// Cancel + submit buttons, used as a modal or drawer footer
export function SubmitButtons({
  onCancel,
  onSubmit,
  submitText,
  cancelText,
  loading = false,
  cancelLoading = false,
  disabled = false,
  disabledReason,
  submitFirst = false,
}: SubmitButtonsProps) {
  const { t } = useTranslation();

  const cancelButton = (
    <Button key="cancel" onClick={onCancel} loading={cancelLoading} disabled={loading}>
      {cancelText ?? t('form.cancel')}
    </Button>
  );
  const submitButton = (
    <Tooltip key="submit" title={disabled ? disabledReason : undefined}>
      <Button
        type="primary"
        loading={loading}
        disabled={disabled || cancelLoading}
        onClick={onSubmit}
      >
        {submitText ?? t('form.save')}
      </Button>
    </Tooltip>
  );

  return <>{submitFirst ? [submitButton, cancelButton] : [cancelButton, submitButton]}</>;
}
