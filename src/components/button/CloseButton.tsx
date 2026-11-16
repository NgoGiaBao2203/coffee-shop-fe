import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

interface CloseButtonProps {
  readonly onClose: () => void;
}

// Right-aligned "Close" button, used as a read-only drawer or modal footer
export function CloseButton({ onClose }: CloseButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end">
      <Button onClick={onClose}>{t('form.close')}</Button>
    </div>
  );
}
