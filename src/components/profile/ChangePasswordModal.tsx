import { Divider, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/modal/AppModal';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';
import type { ChangePasswordRequest } from '@/types/profile';
import { getConfirmPasswordRules, getNewPasswordRules } from '@/utils/formRules';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ChangePasswordRequest) => Promise<void>;
  loading?: boolean;
}

export function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ChangePasswordRequest>();
  const handleFormError = useFormApiError();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: ChangePasswordRequest) => {
    try {
      await onSubmit(values);
      handleClose();
    } catch (error) {
      handleFormError(error, form);
    }
  };

  // Clear the API error of a field as soon as the user edits it
  const clearFieldError = (name: keyof ChangePasswordRequest) => () =>
    form.setFields([{ name, errors: [] }]);

  return (
    <AppModal
      open={open}
      onCancel={handleClose}
      title={t('profile.changePassword')}
      width={480}
      footer={
        <SubmitButtons
          onCancel={handleClose}
          onSubmit={() => form.submit()}
          submitText={t('form.save')}
          loading={loading}
        />
      }
    >
      <Divider className="my-3!" />

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Form.Item
          name="currentPassword"
          label={t('profile.currentPassword')}
          rules={[
            { required: true, whitespace: true, message: t('profile.currentPasswordRequired') },
          ]}
        >
          <Input.Password
            placeholder={t('profile.currentPasswordPlaceholder')}
            autoComplete="current-password"
            onChange={clearFieldError('currentPassword')}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={t('profile.newPassword')}
          rules={getNewPasswordRules(t)}
        >
          <Input.Password
            placeholder={t('profile.newPasswordPlaceholder')}
            autoComplete="new-password"
            onChange={clearFieldError('newPassword')}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={t('profile.confirmPassword')}
          dependencies={['newPassword']}
          rules={getConfirmPasswordRules(t, 'newPassword')}
        >
          <Input.Password
            placeholder={t('profile.confirmPasswordPlaceholder')}
            autoComplete="new-password"
            onChange={clearFieldError('confirmPassword')}
          />
        </Form.Item>
      </Form>
    </AppModal>
  );
}
