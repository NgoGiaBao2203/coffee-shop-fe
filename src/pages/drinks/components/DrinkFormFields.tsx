import { Form, Input, Select } from 'antd';
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { CategorySelectOption } from '../types';

// Check allowed characters for drink name
const isAllowedDrinkNameCharacter = (character: string) =>
  /[\p{L}\p{N}\s&/(),.'-]/u.test(character);

interface DrinkCategoryFieldProps {
  readonly options: CategorySelectOption[];
  readonly onChange?: (
    value: string,
    option?: CategorySelectOption | CategorySelectOption[],
  ) => void;
}

export function DrinkNameField() {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="drinkName"
      label={t('drinks.name')}
      rules={[
        {
          required: true,
          whitespace: true,
          message: t('drinks.validation.nameRequired'),
        },
        {
          max: 100,
          message: t('drinks.validation.nameMaxLength'),
        },
        {
          validator: (_, value: string | undefined) => {
            if (!value || Array.from(value).every(isAllowedDrinkNameCharacter)) {
              return Promise.resolve();
            }

            return Promise.reject(new Error(t('drinks.validation.nameInvalid')));
          },
        },
      ]}
    >
      <Input placeholder={t('form.inputNamePlaceholder')} maxLength={100} />
    </Form.Item>
  );
}

export function DrinkCategoryField({ options, onChange }: DrinkCategoryFieldProps) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="drinkCategoryId"
      label={t('sidebar.categories')}
      rules={[
        {
          required: true,
          message: t('drinks.validation.categoryRequired'),
        },
      ]}
    >
      <Select
        placeholder={t('form.selectCategoryPlaceholder')}
        options={options}
        onChange={onChange}
        notFoundContent={options.length === 0 ? t('drinks.noCategory') : undefined}
      />
    </Form.Item>
  );
}

export function DrinkStatusField({ required = true }: Readonly<{ required?: boolean }>) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="status"
      label={t('drinks.status')}
      rules={required ? [{ required: true }] : undefined}
    >
      <Select
        options={[
          {
            value: 1,
            label: t('drinks.statusActive'),
          },
          {
            value: 0,
            label: t('drinks.statusInactive'),
          },
        ]}
      />
    </Form.Item>
  );
}

export function DrinkUploadAction() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center">
      <PlusOutlined />

      <div style={{ marginTop: 8 }}>{t('drinks.uploadImage')}</div>
    </div>
  );
}

const THOUSANDS_SEPARATOR = '.';

interface PriceInputProps {
  readonly value?: string;
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

// Remove non-digit characters and leading zeros
function cleanPriceDigits(value: string): string {
  let digits = '';

  for (const character of value) {
    if (character >= '0' && character <= '9') {
      digits += character;
    }
  }

  let firstNonZeroIndex = 0;

  while (firstNonZeroIndex < digits.length - 1 && digits[firstNonZeroIndex] === '0') {
    firstNonZeroIndex += 1;
  }

  return digits.slice(firstNonZeroIndex);
}

// Format price with thousands separators
function formatPriceWithDots(value: string): string {
  if (!value) return '';

  let formattedValue = '';

  for (let index = 0; index < value.length; index += 1) {
    if (index > 0 && (value.length - index) % 3 === 0) {
      formattedValue += THOUSANDS_SEPARATOR;
    }

    formattedValue += value[index];
  }

  return formattedValue;
}

function PriceInput({ value = '', onChange }: PriceInputProps) {
  const inputRef = useRef<InputRef>(null);

  // Store caret position based on digit index
  const caretDigitPosition = useRef<number | null>(null);

  // Trigger caret update after price formatting
  const [caretUpdate, setCaretUpdate] = useState(0);

  // Restore caret position after formatted value changes
  useLayoutEffect(() => {
    const targetDigitPosition = caretDigitPosition.current;
    const input = inputRef.current?.input;

    if (targetDigitPosition == null || !input) return;

    let digitCount = 0;
    let caretPosition = 0;

    while (caretPosition < value.length && digitCount < targetDigitPosition) {
      if (value[caretPosition] >= '0' && value[caretPosition] <= '9') {
        digitCount += 1;
      }

      caretPosition += 1;
    }

    input.setSelectionRange(caretPosition, caretPosition);
    caretDigitPosition.current = null;
  }, [value, caretUpdate]);

  // Track caret position before formatting input value
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectionStart = event.currentTarget.selectionStart ?? event.currentTarget.value.length;

    caretDigitPosition.current = cleanPriceDigits(
      event.currentTarget.value.slice(0, selectionStart),
    ).length;

    setCaretUpdate((revision) => revision + 1);
    onChange?.(event);
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      type="text"
      inputMode="numeric"
      onKeyDown={handlePriceKeyDown}
      suffix="đ"
      placeholder="35.000"
    />
  );
}

// Allow only numeric input and common editing keys
function handlePriceKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (
    event.nativeEvent.isComposing ||
    event.nativeEvent.key === 'Process' ||
    event.nativeEvent.key === 'Unidentified'
  ) {
    return;
  }

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

  const isDigit = /^\d$/.test(event.key);

  if (allowedKeys.includes(event.key) || hasShortcut || isDigit) {
    return;
  }

  event.preventDefault();
}

interface DrinkPriceFieldProps {
  readonly minExclusive?: number;
  readonly invalidMessage?: string;
}

/**
 * Price field that stores numeric digits and formats
 * thousands separators for display.
 */
export function DrinkPriceField({ minExclusive = 1, invalidMessage }: DrinkPriceFieldProps = {}) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="price"
      label={t('drinks.price')}
      normalize={(value: string | number | undefined) => cleanPriceDigits(String(value ?? ''))}
      getValueProps={(value: string | number | undefined) => ({
        value: formatPriceWithDots(String(value ?? '')),
      })}
      rules={[
        {
          required: true,
          message: t('drinks.validation.priceRequired'),
        },
        {
          // Validate minimum price based on current form usage
          validator: (_, value: string | null) => {
            if (value == null || value.trim() === '') {
              return Promise.resolve();
            }

            const numericValue = Number(value);

            if (Number.isFinite(numericValue) && numericValue > minExclusive) {
              return Promise.resolve();
            }

            return Promise.reject(new Error(invalidMessage ?? t('drinks.validation.priceInvalid')));
          },
        },
      ]}
    >
      <PriceInput />
    </Form.Item>
  );
}
