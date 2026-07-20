import { Modal } from 'antd';
import type { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title = 'Confirm',
  description,
  okText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      cancelText={cancelText}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      centered
      destroyOnHidden
    >
      {description}
    </Modal>
  );
}
