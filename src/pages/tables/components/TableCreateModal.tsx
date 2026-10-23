import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import type { TableFormValues, TableShopOption } from '../types';
import { TableFormModal } from './TableFormModal';
import {
  TableDescriptionField,
  TableNumberField,
  TableShopField,
  TableStatusField,
} from './TableFormFields';
import { useTableFormError } from '../hooks/useTableFormError';

export type TableCreateValues = TableFormValues;

interface TableCreateModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (values: TableCreateValues) => Promise<void> | void;
  readonly loading?: boolean;
  readonly shopOptions: TableShopOption[];
  readonly optionsLoading?: boolean;
  readonly defaultShopId?: string;
}

export function TableCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  shopOptions,
  optionsLoading = false,
  defaultShopId,
}: TableCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<TableCreateValues>();
  const handleApiError = useTableFormError(form);
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    if (isOpenedRef.current) return;

    isOpenedRef.current = true;
    form.resetFields();
    form.setFieldValue('status', 1);
    if (isOwner) {
      const initialShopId = defaultShopId || shopOptions[0]?.value;
      if (initialShopId) form.setFieldValue('shopId', initialShopId);
    }
  }, [open, isOwner, defaultShopId, shopOptions, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: TableCreateValues) => {
    try {
      await onSubmit({
        ...values,
        tableNumber: Number(values.tableNumber),
        description: values.description?.trim() || undefined,
      });
      handleClose();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  return (
    <TableFormModal<TableCreateValues>
      open={open}
      onClose={handleClose}
      form={form}
      onFinish={handleSubmit}
      loading={loading}
      title={t('tables.createTitle')}
      submitLabel={t('form.create')}
    >
      <TableNumberField />
      <TableDescriptionField />
      <TableStatusField />
      <TableShopField isOwner={isOwner} options={shopOptions} optionsLoading={optionsLoading} />
    </TableFormModal>
  );
}
