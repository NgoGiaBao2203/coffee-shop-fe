import { useEffect } from 'react';
import { Modal, Form, Input, Select, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { useFormApiError } from '@/hooks/useFormApiError';

export interface CategoryCreateValues {
  categoryName: string;
  shopId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface CategoryCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryCreateValues) => Promise<void> | void;
  loading?: boolean;
  shopOptions: SelectOption[];
  optionsLoading?: boolean;
}

export function CategoryCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  shopOptions,
  optionsLoading = false,
}: CategoryCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CategoryCreateValues>();
  const handleFormError = useFormApiError();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isManager = roleName === ROLES.MANAGER;

  // Default to the first shop; for MANAGER the options only contain their own shop
  useEffect(() => {
    if (open && shopOptions.length > 0) {
      form.setFieldValue('shopId', shopOptions[0].value);
    }
  }, [open, shopOptions, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: CategoryCreateValues) => {
    try {
      await onSubmit({ ...values, categoryName: values.categoryName.trim() });
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
      title={t('categories.createTitle')}
      width={480}
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
        <Form.Item
          name="categoryName"
          label={t('categories.name')}
          rules={[
            { required: true, whitespace: true, message: t('categories.nameRequired') },
            { max: 100, message: t('categories.nameMaxLength') },
            {
              // Allows: Unicode letters, numbers, spaces, and punctuation: - & / ( ) , . '
              pattern: /^[\p{L}\p{N}\s\-&/(),.']+$/u,
              message: t('responses.EV007'),
            },
          ]}
        >
          <Input onChange={() => form.setFields([{ name: 'categoryName', errors: [] }])} />
        </Form.Item>

        {isManager ? (
          <Form.Item name="shopId" hidden>
            <Input />
          </Form.Item>
        ) : (
          <Form.Item
            name="shopId"
            label={t('staffs.shopName')}
            rules={[{ required: true, message: t('categories.shopRequired') }]}
          >
            <Select options={shopOptions} loading={optionsLoading} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
