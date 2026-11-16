import { Divider, Form, Modal, type FormInstance, type FormProps } from 'antd';
import type { ReactNode } from 'react';
import { SubmitButtons } from '@/components/button/SubmitButtons';

interface DrinkFormModalProps<T extends object> {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly form: FormInstance<T>;
  readonly onFinish: FormProps<T>['onFinish'];
  readonly loading: boolean;
  readonly title: string;
  readonly submitLabel: string;
  readonly children: ReactNode;
  readonly destroyOnHidden?: boolean;
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
  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      title={title}
      width="min(520px, calc(100vw - 24px))"
      destroyOnHidden={destroyOnHidden}
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

      {/* Shared form container for drink create and edit modals */}
      <Form<T>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(changedValues) => {
          // Clear drink name API error when the value changes
          if ('drinkName' in changedValues) {
            form.setFields([
              {
                name: ['drinkName'] as never,
                errors: [],
              },
            ]);
          }
        }}
      >
        {children}
      </Form>
    </Modal>
  );
}
