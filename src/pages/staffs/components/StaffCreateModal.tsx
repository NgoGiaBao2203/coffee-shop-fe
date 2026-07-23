import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Divider, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';

const DEFAULT_ROLE_LABEL = 'NHÂN VIÊN';

export interface StaffCreateValues {
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  shopId?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface StaffCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: StaffCreateValues) => Promise<void> | void;
  loading?: boolean;
  roleOptions: SelectOption[];
  shopOptions: SelectOption[];
  optionsLoading?: boolean;
}

export function StaffCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  roleOptions,
  shopOptions,
  optionsLoading = false,
}: StaffCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StaffCreateValues>();

  useEffect(() => {
    if (!open || roleOptions.length === 0) return;
    const defaultRole = roleOptions.find((r) => r.label === DEFAULT_ROLE_LABEL);
    if (defaultRole) {
      form.setFieldValue('roleId', defaultRole.value);
    }
  }, [open, roleOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: StaffCreateValues) => {
    try {
      await onSubmit(values);
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.CONFLICT) {
        const message = (error.response?.data?.message ?? '').toLowerCase();
        let fieldName: keyof StaffCreateValues;
        let errorMsg: string;

        if (message.includes('phone')) {
          fieldName = 'phoneNumber';
          errorMsg = t('staffs.phoneConflict');
        } else if (message.includes('email')) {
          fieldName = 'email';
          errorMsg = t('staffs.emailConflict');
        } else {
          fieldName = 'username';
          errorMsg = t('staffs.usernameConflict');
        }

        notification.error({
          message: t('common.error'),
          description: errorMsg,
          placement: 'topRight',
          duration: 3,
        });
        form.setFields([{ name: fieldName, errors: [errorMsg] }]);
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('staffs.createTitle')}
      width={560}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.create')}
          </Button>
        </div>
      }
    >
      <Divider className="my-3!" />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="fullName"
            label={t('staffs.fullName')}
            rules={[{ required: true, message: t('staffs.fullNameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phoneNumber" label={t('staffs.phoneNumber')}>
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('staffs.email')}
            rules={[
              { required: true, message: t('staffs.emailRequired') },
              { type: 'email', message: t('staffs.emailInvalid') },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label={t('staffs.username')}
            rules={[{ required: true, message: t('staffs.usernameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="roleId" label={t('staffs.role')}>
            <Select options={roleOptions} loading={optionsLoading} />
          </Form.Item>

          <Form.Item name="shopId" label={t('staffs.shopName')}>
            <Select options={shopOptions} loading={optionsLoading} allowClear />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
