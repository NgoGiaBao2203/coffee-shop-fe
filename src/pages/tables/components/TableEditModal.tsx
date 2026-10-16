import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import type { TableFormValues, TableItem, TableShopOption } from '../types';
import { TableFormModal } from './TableFormModal';
import {
  TableDescriptionField,
  TableNumberField,
  TableShopField,
  TableStatusField,
} from './TableFormFields';
import { useTableFormError } from '../hooks/useTableFormError';

export type TableEditValues = TableFormValues;

interface TableEditModalProps {
  open: boolean;
  onClose: () => void;
  record: TableItem | null;
  onSubmit: (values: TableEditValues) => Promise<void> | void;
  loading?: boolean;
  shopOptions?: TableShopOption[];
  optionsLoading?: boolean;
}

export function TableEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
  shopOptions = [],
  optionsLoading = false,
}: TableEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<TableEditValues>();
  const handleApiError = useTableFormError(form);
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    if (isOpenedRef.current || !record) return;

    isOpenedRef.current = true;
    form.resetFields();
    form.setFieldsValue({
      tableNumber: record.tableNumber,
      description: record.description ?? '',
      status: record.status ?? 1,
      shopId: record.shopId,
    });
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: TableEditValues) => {
    try {
      await onSubmit({
        ...values,
        tableNumber: Number(values.tableNumber),
        description: values.description?.trim() || undefined,
        shopId: record?.shopId ?? values.shopId,
      });
      handleClose();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  return (
    <TableFormModal<TableEditValues>
      open={open}
      onClose={handleClose}
      form={form}
      onFinish={handleSubmit}
      loading={loading}
      title={t('tables.editTitle')}
      submitLabel={t('form.save')}
    >
      <TableNumberField />
      <TableDescriptionField />
      <TableStatusField />
      <TableShopField
        isOwner={isOwner}
        options={shopOptions}
        optionsLoading={optionsLoading}
        disabled
      />
    </TableFormModal>
  );
}
