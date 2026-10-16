import { Button, Divider, Form, Modal, type FormInstance, type FormProps } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface DrinkFormModalProps<T extends object> {
  open: boolean;
  onClose: () => void;
  form: FormInstance<T>;
  onFinish: FormProps<T>['onFinish'];
  loading: boolean;
  title: string;
  submitLabel: string;
  children: ReactNode;
  destroyOnHidden?: boolean;
}

export function DrinkFormModal<T extends object>({
  open,
  onClose,
  form,
  onFinish,
  loading,
  title,
  submitLabel,
  children,
  destroyOnHidden = false,
}: DrinkFormModalProps<T>) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      title={title}
      width="min(520px, calc(100vw - 24px))"
      destroyOnHidden={destroyOnHidden}
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
          if ('drinkName' in changedValues) {
            form.setFields([{ name: ['drinkName'] as never, errors: [] }]);
          }
        }}
      >
        {children}
      </Form>
    </Modal>
  );
}
