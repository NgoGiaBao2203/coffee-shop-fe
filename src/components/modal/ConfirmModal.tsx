import { App } from 'antd';
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

  return { confirm };
}
