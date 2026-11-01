import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface ConfirmOptions {
  title?: ReactNode;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  okDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmModal() {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const confirm = ({
    title,
    content,
    okText,
    cancelText,
    okDanger = false,
    onConfirm,
  }: ConfirmOptions) => {
    modal.confirm({
      title,
      content,
      okText,
      cancelText,
      okButtonProps: { danger: okDanger },
      onOk: onConfirm,
      centered: true,
    });
  };

  // Delete confirmation with the shared delete/cancel labels and a danger OK button
  const confirmDelete = (options: ConfirmOptions) => {
    confirm({
      okText: t('table.deleteOk'),
      cancelText: t('table.deleteCancel'),
      okDanger: true,
      ...options,
    });
  };

  return { confirm, confirmDelete };
}
