import { useEffect } from 'react';
import { Modal, Form, Input, Select, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@/permission/roles';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';
import { getPhoneNumberRule, normalizePhoneNumber } from '@/utils/formRules';

const DEFAULT_ROLE_LABEL = ROLES.STAFF;

export interface StaffCreateValues {
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  shopId: string;
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
  isManager?: boolean;
}

export function StaffCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  roleOptions,
  shopOptions,
  optionsLoading = false,
  isManager = false,
}: StaffCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StaffCreateValues>();
  const handleFormError = useFormApiError();

  // Default role STAFF and the first shop; for MANAGER the shop options only contain their shop
  // (the backend forces role STAFF for a manager anyway)
  useEffect(() => {
    if (!open) return;
    const defaultRole = roleOptions.find((r) => r.label === DEFAULT_ROLE_LABEL);
    if (defaultRole) {
      form.setFieldValue('roleId', defaultRole.value);
    }
    if (shopOptions.length > 0) {
      form.setFieldValue('shopId', shopOptions[0].value);
    }
  }, [open, roleOptions, shopOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: StaffCreateValues) => {
    try {
      await onSubmit({
        ...values,
        fullName: values.fullName?.trim(),
        phoneNumber: values.phoneNumber || undefined,
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
      title={t('staffs.createTitle')}
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
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="fullName"
            label={t('staffs.fullName')}
            rules={[{ required: true, message: t('staffs.fullNameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={t('staffs.phoneNumber')}
            normalize={normalizePhoneNumber}
            rules={[getPhoneNumberRule(t)]}
          >
            <Input maxLength={11} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('staffs.email')}
            rules={[
              { required: true, whitespace: true, message: t('staffs.emailRequired') },
              { type: 'email', message: t('staffs.emailInvalid') },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label={t('staffs.username')}
            rules={[{ required: true, whitespace: true, message: t('staffs.usernameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="roleId"
            label={t('staffs.role')}
            rules={[{ required: true, message: t('staffs.roleRequired') }]}
          >
            <Select options={roleOptions} loading={optionsLoading} disabled={isManager} />
          </Form.Item>

          <Form.Item
            name="shopId"
            label={t('staffs.shopName')}
            rules={[{ required: true, message: t('staffs.shopRequired') }]}
          >
            <Select options={shopOptions} loading={optionsLoading} disabled={isManager} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
