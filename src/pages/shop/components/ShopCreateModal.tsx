import { Modal, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';
import type { CreateShopRequest } from '../types';
import { ShopFormFields } from './ShopFormFields';

export type ShopCreateValues = CreateShopRequest;

interface ShopCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ShopCreateValues) => Promise<void> | void;
  loading?: boolean;
}

export function ShopCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: ShopCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ShopCreateValues>();
  const handleFormError = useFormApiError();

  // Reset form inputs and close modal
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  // Duplicate name / address comes back as ER008 with a message, shown on that field
  const handleSubmit = async (values: ShopCreateValues) => {
    try {
      await onSubmit({
        shopName: values.shopName.trim(),
        address: values.address.trim(),
        phoneNumber: values.phoneNumber.trim(),
      });
      handleClose();
    } catch (error) {
      handleFormError(error, form);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('shops.createTitle')}
      width={560}
      footer={
        <SubmitButtons
          onCancel={handleClose}
          onSubmit={() => form.submit()}
          submitText={t('form.create')}
          loading={loading}
        />
      }
    >
      <Divider className="my-3!" />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <ShopFormFields />
      </Form>
    </Modal>
  );
}
