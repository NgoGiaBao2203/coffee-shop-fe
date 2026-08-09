import { useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import type { CategoryItem } from '../types';

export interface CategoryEditValues {
  categoryName: string;
}

interface CategoryEditModalProps {
  open: boolean;
  onClose: () => void;
  record: CategoryItem | null;
  onSubmit: (values: CategoryEditValues) => Promise<void> | void;
  loading?: boolean;
}

export function CategoryEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: CategoryEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CategoryEditValues>();
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    if (!isOpenedRef.current && record) {
      isOpenedRef.current = true;
      form.resetFields();
      form.setFieldsValue({ categoryName: record.categoryName });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: CategoryEditValues) => {
    try {
      await onSubmit(values);
      handleClose();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === RESPONSE_CODE.INVALID_REQUEST
      ) {
        form.setFields([
          {
            name: 'categoryName',
            errors: [t('categories.nameConflict')],
          },
        ]);
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('categories.editTitle')}
      width={480}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.save')}
          </Button>
        </div>
      }
    >
      <Divider className="my-3!" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          if ('categoryName' in changedValues) {
            form.setFields([{ name: 'categoryName', errors: [] }]);
          }
        }}
      >
        <Form.Item
          name="categoryName"
          label={t('categories.name')}
          rules={[{ required: true, message: t('categories.nameRequired') }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
