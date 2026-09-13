import { useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Divider, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import type { ShopBranchItem, EditShopBranchRequest } from '../types';

export type ShopBranchEditValues = Omit<EditShopBranchRequest, 'shopId'>;

interface ShopBranchEditModalProps {
  open: boolean;
  onClose: () => void;
  record: ShopBranchItem | null;
  onSubmit: (values: EditShopBranchRequest) => Promise<void> | void;
  loading?: boolean;
}

export function ShopBranchEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
}: ShopBranchEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ShopBranchEditValues>();

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
        shopName: record.shopName,
        phoneNumber: record.phoneNumber || '',
        address: record.address,
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: ShopBranchEditValues) => {
    if (!record) return;

    try {
      const payload: EditShopBranchRequest = {
        ...values,
        shopId: record.shopId,
        shopName: values.shopName?.trim(),
        address: values.address?.trim(),
        phoneNumber: values.phoneNumber.trim(),
      };

      await onSubmit(payload);
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const resData = error.response.data;
        const code = resData.code;
        const serverMessage = (resData.message ?? '').toLowerCase();

        // Handle conflict error (ER005 / 409)
        if (code === RESPONSE_CODE.CONFLICT || code === 'ER005' || error.response.status === 409) {
          let fieldName: keyof ShopBranchEditValues;
          let localizedError: string;

          if (serverMessage.includes('address')) {
            fieldName = 'address';
            localizedError = t('shopBranches.addressConflict');
          } else {
            fieldName = 'shopName';
            localizedError = t('shopBranches.nameConflict');
          }

          notification.error({
            message: t('common.error'),
            description: localizedError,
            placement: 'topRight',
            duration: 3,
          });

          form.setFields([{ name: fieldName, errors: [localizedError] }]);
          return;
        }

        // Handle field validation errors (ER008)
        if (resData.errorDetails && Array.isArray(resData.errorDetails)) {
          const fieldErrors = resData.errorDetails.map(
            (err: { field: string; message: string }) => ({
              name: err.field,
              errors: [t(`responses.${err.message}`) || err.message],
            }),
          );
          form.setFields(fieldErrors);
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('shopBranches.editTitle')}
      width={560}
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
          const changedField = Object.keys(changedValues)[0] as keyof ShopBranchEditValues;
          if (changedField) {
            form.setFields([{ name: changedField, errors: [] }]);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="shopName"
            label={t('shopBranches.shopName')}
            rules={[
              { required: true, whitespace: true, message: t('responses.EV001') },
              { max: 100, message: t('responses.EV005') },
              {
                pattern: /^[\p{L}0-9\s.,&'-]+$/u,
                message: t('responses.EV007'),
              },
            ]}
          >
            <Input placeholder={t('shopBranches.shopNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={t('shopBranches.phoneNumber')}
            normalize={(value: string) => (value ? value.replace(/\D/g, '').slice(0, 11) : '')}
            rules={[
              { required: true, whitespace: true, message: t('responses.EV001') },
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') {
                    return Promise.resolve();
                  }
                  const trimmed = value.trim();
                  if (!trimmed.startsWith('0')) {
                    return Promise.reject(new Error(t('responses.EV008')));
                  }
                  if (trimmed.length < 10 || trimmed.length > 11) {
                    return Promise.reject(new Error(t('responses.EV009')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder={t('shopBranches.phoneNumberPlaceholder')} maxLength={11} />
          </Form.Item>

          <div className="col-span-2">
            <Form.Item
              name="address"
              label={t('shopBranches.address')}
              rules={[
                { required: true, whitespace: true, message: t('responses.EV001') },
                { max: 255, message: t('responses.EV005') },
                {
                  pattern: /^[\p{L}0-9\s/.,#-]+$/u,
                  message: t('responses.EV007'),
                },
              ]}
            >
              <Input.TextArea rows={3} placeholder={t('shopBranches.addressPlaceholder')} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
