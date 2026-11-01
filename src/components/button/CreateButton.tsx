import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface CreateButtonProps {
  readonly onClick: () => void;
  readonly className?: string;
}

// Primary "Create" button shown in a page header to open the create modal
export function CreateButton({ onClick, className }: CreateButtonProps) {
  const { t } = useTranslation();

  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={onClick} className={className}>
      {t('form.create')}
    </Button>
  );
}
