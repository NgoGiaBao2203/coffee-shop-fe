import { Button, Divider, Form, Modal, type FormInstance, type FormProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

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
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      title={title}
      width={480}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {submitLabel}
          </Button>
        </div>
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
