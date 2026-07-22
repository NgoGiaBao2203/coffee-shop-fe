import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@/permission/roles';
import type { StaffItem } from '../types';

export interface StaffEditValues {
  fullName: string;
  phoneNumber: string;
  roleName: string;
  shopName: string;
}

interface StaffEditModalProps {
  open: boolean;
  onClose: () => void;
  record: StaffItem | null;
  onSubmit: (values: StaffEditValues) => Promise<void> | void;
  loading?: boolean;
}

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: role }));

export function StaffEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: StaffEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<StaffEditValues>();

  useEffect(() => {
    if (!open || !record) return;
    form.resetFields();
    form.setFieldsValue({
      fullName: record.fullName,
      phoneNumber: record.phoneNumber,
      roleName: record.roleName,
      shopName: record.shopName ?? '',
    });
  }, [open, record]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: StaffEditValues) => {
    await onSubmit(values);
    handleClose();
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

          <Form.Item name="roleName" label={t('staffs.role')} rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>

          <Form.Item name="shopName" label={t('staffs.shopName')}>
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
