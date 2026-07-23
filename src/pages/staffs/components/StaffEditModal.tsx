import { useEffect, useRef } from 'react'; // 1. Import useRef
import { Modal, Form, Input, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import type { StaffItem } from '../types';

export interface StaffEditValues {
  fullName: string;
  phoneNumber: string;
  roleId: string;
  shopId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface StaffEditModalProps {
  open: boolean;
  onClose: () => void;
  record: StaffItem | null;
  onSubmit: (values: StaffEditValues) => Promise<void> | void;
  loading?: boolean;
  roleOptions: SelectOption[];
  shopOptions: SelectOption[];
  optionsLoading?: boolean;
}

export function StaffEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
  roleOptions,
  shopOptions,
  optionsLoading = false,
}: StaffEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StaffEditValues>();

  // Ref to ensure fields are ONLY reset when opening the modal, NOT on parent re-renders
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }

    // Only populate fields ONCE when the modal transitions from closed -> open
    if (!isOpenedRef.current && record) {
      isOpenedRef.current = true;
      form.resetFields();

      const matchedRole = roleOptions.find(
        (r) => r.label.trim().toLowerCase() === record.roleName?.trim().toLowerCase(),
      );
      const matchedShop = shopOptions.find(
        (s) => s.label.trim().toLowerCase() === record.shopName?.trim().toLowerCase(),
      );

      form.setFieldsValue({
        fullName: record.fullName,
        phoneNumber: record.phoneNumber,
        roleId: matchedRole?.value,
        shopId: matchedShop?.value,
      });
    }
  }, [open, record, roleOptions, shopOptions, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: StaffEditValues) => {
    try {
      await onSubmit(values);
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.CONFLICT) {
        // Set error message directly on the field
        form.setFields([
          {
            name: 'phoneNumber',
            errors: [t('staffs.phoneNumberConflict')],
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
      title={t('staffs.editTitle')}
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.save')}
          </Button>
        </div>
      }
    >
      {/* Read-only info */}
      {record && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-gray-50 rounded-lg px-4 py-3 mb-4 text-sm">
          <div>
            <span className="text-gray-500">{t('staffs.username')}: </span>
            <span className="font-medium">{record.username}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('staffs.email')}: </span>
            <span className="font-medium">{record.email}</span>
          </div>
        </div>
      )}

      <Divider className="my-3!" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          if ('phoneNumber' in changedValues) {
            form.setFields([
              {
                name: 'phoneNumber',
                errors: [],
              },
            ]);
          }
        }}
      >
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
            name="roleId"
            label={t('staffs.role')}
            rules={[{ required: true, message: t('staffs.roleRequired') }]}
          >
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
