import { Form, Input, Select } from 'antd';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableShopOption } from '../types';

const TABLE_DESCRIPTION_PATTERN = /^[\p{L}\p{N}\s\-&/(),.']*$/u;

interface TableShopFieldProps {
  isOwner: boolean;
  options: TableShopOption[];
  optionsLoading: boolean;
  disabled?: boolean;
}

function cleanTableNumber(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function handleTableNumberKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.nativeEvent.isComposing || event.key === 'Process' || event.keyCode === 229) return;

  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ];
  const hasShortcut =
    (event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase());
  if (allowedKeys.includes(event.key) || hasShortcut || /^[0-9]$/.test(event.key)) return;
  event.preventDefault();
}

export function TableNumberField() {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="tableNumber"
      label={t('tables.tableNumber')}
      normalize={(value: string | number | undefined) => cleanTableNumber(String(value ?? ''))}
      rules={[
        {
          validator: (_, value) => {
            if (value === undefined || value === null || value === '') {
              return Promise.reject(new Error(t('tables.tableNumberRequired')));
            }
            const number = Number(value);
            if (Number.isNaN(number) || !Number.isInteger(number) || number < 1) {
              return Promise.reject(new Error(t('tables.tableNumberInvalid')));
            }
            if (number > 9999) {
              return Promise.reject(new Error(t('tables.tableNumberMax')));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Input
        type="text"
        inputMode="numeric"
        onKeyDown={handleTableNumberKeyDown}
        placeholder={t('tables.tableNumberPlaceholder')}
      />
    </Form.Item>
  );
}

export function TableDescriptionField() {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="description"
      label={t('tables.description')}
      rules={[
        { max: 255, message: t('responses.EV005') },
        { pattern: TABLE_DESCRIPTION_PATTERN, message: t('responses.EV007') },
      ]}
    >
      <Input.TextArea
        rows={2}
        maxLength={255}
        showCount
        placeholder={t('tables.descriptionPlaceholder')}
      />
    </Form.Item>
  );
}

export function TableStatusField() {
  const { t } = useTranslation();

  return (
    <Form.Item name="status" label={t('tables.status')} rules={[{ required: true }]}>
      <Select
        options={[
          { value: 1, label: t('tables.statusOptions.available') },
          { value: 2, label: t('tables.statusOptions.occupied') },
          { value: 3, label: t('tables.statusOptions.reserved') },
        ]}
      />
    </Form.Item>
  );
}

export function TableShopField({
  isOwner,
  options,
  optionsLoading,
  disabled = false,
}: TableShopFieldProps) {
  const { t } = useTranslation();

  if (!isOwner) {
    return (
      <Form.Item name="shopId" hidden>
        <Input />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name="shopId"
      label={t('tables.shopName')}
      rules={[{ required: true, message: t('tables.shopRequired') }]}
    >
      <Select
        disabled={disabled}
        options={options}
        loading={optionsLoading}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  );
}
