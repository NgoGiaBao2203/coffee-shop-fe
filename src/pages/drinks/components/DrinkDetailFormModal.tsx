import { useEffect } from 'react';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { DrinkFormModal } from './DrinkFormModal';
import { DrinkPriceField } from './DrinkFormFields';
import type { DrinkDetailFormValues, DrinkDetailSubmitValues, DrinkVariantItem } from '../types';
import type { DrinkSize } from '../constants';

interface Props {
  readonly open: boolean;
  readonly mode: 'create' | 'edit';
  readonly record?: DrinkVariantItem | null;
  readonly availableSizes: readonly DrinkSize[];
  readonly loading: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (values: DrinkDetailSubmitValues) => Promise<void>;
}

export function DrinkDetailFormModal({
  open,
  mode,
  record,
  availableSizes,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const [form] = Form.useForm<DrinkDetailFormValues>();

  // Set default form values when opening the modal
  useEffect(() => {
    if (!open) return;

    form.resetFields();

    // Fill current variant data when editing
    if (mode === 'edit' && record) {
      form.setFieldsValue({
        size: record.size as DrinkSize,
        price: String(record.price),
      });

      return;
    }

    // Select the first available size when creating
    const firstAvailableSize = availableSizes[0];

    if (firstAvailableSize) {
      form.setFieldsValue({
        size: firstAvailableSize,
      });
    }
  }, [open, mode, record, availableSizes, form]);

  // Reset form data when closing the modal
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  // Convert form values and submit drink detail data
  const handleSubmit = async (values: DrinkDetailFormValues) => {
    await onSubmit({
      size: values.size,
      price: Number(values.price),
    });

    handleClose();
  };

  // Build size options for create and edit modes
  const sizeOptions =
    mode === 'edit' && record
      ? [
          {
            value: record.size as DrinkSize,
            label: record.size,
          },
        ]
      : availableSizes.map((size) => ({
          value: size,
          label: size,
        }));

  return (
    <DrinkFormModal<DrinkDetailFormValues>
      open={open}
      onClose={handleClose}
      form={form}
      onFinish={handleSubmit}
      loading={loading}
      title={mode === 'create' ? t('drinkDetails.createTitle') : t('drinkDetails.editTitle')}
      submitLabel={mode === 'create' ? t('form.create') : t('form.save')}
      destroyOnHidden
    >
      {/* Drink size */}
      <Form.Item
        name="size"
        label={t('drinks.size')}
        rules={[
          {
            required: true,
            message: t('drinks.validation.sizeRequired'),
          },
        ]}
      >
        <Select
          options={sizeOptions}
          disabled={mode === 'edit'}
          placeholder={t('drinkDetails.selectSize')}
        />
      </Form.Item>

      {/* Drink detail price */}
      <DrinkPriceField
        minExclusive={0}
        invalidMessage={t('drinkDetails.validation.priceInvalid')}
      />
    </DrinkFormModal>
  );
}
