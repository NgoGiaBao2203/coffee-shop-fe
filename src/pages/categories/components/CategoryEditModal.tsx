import { useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';
import type { CategoryItem } from '../types';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';

export interface CategoryEditValues {
  categoryName: string;
  shopId: string;
}

interface CategoryEditModalProps {
  open: boolean;
  onClose: () => void;
  record: CategoryItem | null;
  onSubmit: (values: CategoryEditValues) => Promise<void> | void;
  shopOptions: { value: string; label: string }[];
  optionsLoading?: boolean;
  loading?: boolean;
}

export function CategoryEditModal({
  open,
  onClose,
  record,
  onSubmit,
  shopOptions,
  optionsLoading = false,
  loading = false,
}: CategoryEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CategoryEditValues>();
  const handleFormError = useFormApiError();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;
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
        categoryName: record.categoryName,
        shopId: record.shopId,
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: CategoryEditValues) => {
    try {
      await onSubmit({
        ...values,
        categoryName: values.categoryName.trim(),
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
      title={t('categories.editTitle')}
      width={480}
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
          if ('categoryName' in changedValues) {
            form.setFields([{ name: 'categoryName', errors: [] }]);
          }
        }}
      >
        <Form.Item
          name="categoryName"
          label={t('categories.name')}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('categories.nameRequired'),
            },
            {
              max: 100,
              message: t('categories.nameMaxLength'),
            },
            {
              // Allows: Unicode letters, numbers, spaces, and punctuation: - & / ( ) , . '
              pattern: /^[\p{L}\p{N}\s\-&/(),.']+$/u,
              message: t('responses.EV007'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        {isOwner ? (
          <Form.Item
            name="shopId"
            label={t('staffs.shopName')}
            rules={[{ required: true, message: t('categories.shopRequired') }]}
          >
            {/* The API edits the category in its current shop, it cannot move it to another shop */}
            <Select options={shopOptions} loading={optionsLoading} disabled />
          </Form.Item>
        ) : (
          <Form.Item
            name="shopId"
            hidden
            rules={[{ required: true, message: t('categories.shopRequired') }]}
          >
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
