import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';

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
  const profileShopName = useAppSelector((state) => state.auth.profile?.shopName);
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isManager = roleName === ROLES.MANAGER;

  useEffect(() => {
    if (!open || shopOptions.length === 0) return;
    if (isManager && profileShopName) {
      const matchedShop = shopOptions.find(
        (s) => s.label.trim().toLowerCase() === profileShopName.trim().toLowerCase(),
      );
      form.setFieldValue('shopId', matchedShop?.value ?? shopOptions[0].value);
    } else {
      form.setFieldValue('shopId', shopOptions[0].value);
    }
  }, [open, shopOptions, isManager, profileShopName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: CategoryCreateValues) => {
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
      title={t('categories.createTitle')}
      width={480}
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
        <Form.Item
          name="categoryName"
          label={t('categories.name')}
          rules={[{ required: true, message: t('categories.nameRequired') }]}
        >
          <Input onChange={() => form.setFields([{ name: 'categoryName', errors: [] }])} />
        </Form.Item>

        <Form.Item
          name="shopId"
          label={t('staffs.shopName')}
          rules={[{ required: true, message: t('categories.shopRequired') }]}
        >
          <Select options={shopOptions} loading={optionsLoading} disabled={isManager} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
