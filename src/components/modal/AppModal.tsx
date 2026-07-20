import { Modal, type ModalProps } from 'antd';
import type { ReactNode } from 'react';

interface AppModalProps extends Omit<ModalProps, 'title'> {
  title?: ReactNode;
  children: ReactNode;
}

export function AppModal({ title, children, ...props }: AppModalProps) {
  return (
    <Modal title={title} destroyOnHidden centered {...props}>
      {children}
    </Modal>
  );
}
