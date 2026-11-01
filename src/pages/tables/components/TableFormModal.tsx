import { Divider, Form, Modal, type FormInstance, type FormProps } from 'antd';
import type { ReactNode } from 'react';
import { SubmitButtons } from '@/components/button/SubmitButtons';

interface TableFormModalProps<T extends object> {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly form: FormInstance<T>;
  readonly onFinish: FormProps<T>['onFinish'];
  readonly loading: boolean;
  readonly title: string;
  readonly submitLabel: string;
  readonly children: ReactNode;
}

export function TableFormModal<T extends object>({
  open,
  onClose,
  form,
  onFinish,
  loading,
  title,
  submitLabel,
  children,
}: TableFormModalProps<T>) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      title={title}
      width={480}
      footer={
        <SubmitButtons
          onCancel={onClose}
          onSubmit={() => form.submit()}
          submitText={submitLabel}
          loading={loading}
        />
      }
    >
      <Divider className="my-3!" />
      <Form<T>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(changedValues) => {
          if ('tableNumber' in changedValues) {
            form.setFields([{ name: ['tableNumber'] as never, errors: [] }]);
          }
        }}
      >
        {children}
      </Form>
    </Modal>
  );
}
