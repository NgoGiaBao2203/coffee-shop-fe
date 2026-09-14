import { useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';
import type { CategoryItem } from '../types';

export interface CategoryEditValues {
  categoryName: string;
  shopId: string;
}

interface ErrorDetailItem {
  errorCode?: string | number;
  message?: string;
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
      form.setFieldsValue({ categoryName: record.categoryName, shopId: record.shopId });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: CategoryEditValues) => {
    try {
      await onSubmit({ ...values, categoryName: values.categoryName.trim() });
      handleClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const resData = error.response?.data;
        const resCode = resData?.code;
        const details: ErrorDetailItem[] = Array.isArray(resData?.errorDetails)
          ? resData.errorDetails
          : Array.isArray(resData?.data)
            ? resData.data
            : [];

        const isConflict =
          resCode === RESPONSE_CODE.CONFLICT ||
          resCode === 'ER005' ||
          resCode === 'ER011' ||
          details.some(
            (item) =>
              item.errorCode === 'ER005' ||
              item.errorCode === 'ER011' ||
              item.errorCode === 409 ||
              item.errorCode === RESPONSE_CODE.CONFLICT,
          );

        if (isConflict) {
          form.setFields([
            {
              name: 'categoryName',
              errors: [t('categories.nameConflict')],
            },
          ]);
        }
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
          rules={[
            { required: true, whitespace: true, message: t('categories.nameRequired') },
            { max: 100, message: t('categories.nameMaxLength') },
            {
              pattern: /^[\p{L}\p{N}\s\-']+$/u,
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
            <Select options={shopOptions} loading={optionsLoading} />
          </Form.Item>
        ) : (
          <Form.Item name="shopId" hidden>
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
