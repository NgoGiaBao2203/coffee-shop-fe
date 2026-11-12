import { useEffect, useRef } from 'react';
import { Modal, Form, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';
import type { ShopItem, EditShopRequest } from '../types';
import { ShopFormFields } from './ShopFormFields';

export type ShopEditValues = EditShopRequest;

interface ShopEditModalProps {
  open: boolean;
  onClose: () => void;
  record: ShopItem | null;
  onSubmit: (values: EditShopRequest) => Promise<void> | void;
  loading?: boolean;
}

export function ShopEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: ShopEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ShopEditValues>();
  const handleFormError = useFormApiError();

  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }

    if (!isOpenedRef.current && record) {
      isOpenedRef.current = true;
      form.resetFields();

      form.setFieldsValue({
        shopName: record.shopName,
        phoneNumber: record.phoneNumber || '',
        address: record.address,
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  // Duplicate name / address comes back as 409 ER005 with a message, shown on that field
  const handleSubmit = async (values: ShopEditValues) => {
    if (!record) return;

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
      title={t('shops.editTitle')}
      width={560}
      footer={
        <SubmitButtons onCancel={handleClose} onSubmit={() => form.submit()} loading={loading} />
      }
    >
      <Divider className="my-3!" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          const changedField = Object.keys(changedValues)[0] as keyof ShopEditValues;
          if (changedField) {
            form.setFields([{ name: changedField, errors: [] }]);
          }
        }}
      >
        <ShopFormFields />
      </Form>
    </Modal>
  );
}
