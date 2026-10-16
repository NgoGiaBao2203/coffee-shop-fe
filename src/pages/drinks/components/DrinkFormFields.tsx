import { Form, Input, Select, type InputProps, type InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
  type CompositionEvent,
} from 'react';
import type { CategorySelectOption } from '../types';

const DRINK_NAME_PATTERN = /^[\p{L}\p{N}\s&/(),.'-]+$/u;

interface DrinkCategoryFieldProps {
  options: CategorySelectOption[];
  onChange?: (value: string, option?: CategorySelectOption | CategorySelectOption[]) => void;
}

export function DrinkNameField() {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="drinkName"
      label={t('drinks.name')}
      rules={[
        { required: true, whitespace: true, message: t('drinks.validation.nameRequired') },
        { max: 100, message: t('drinks.validation.nameMaxLength') },
        { pattern: DRINK_NAME_PATTERN, message: t('drinks.validation.nameInvalid') },
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
      rules={[{ required: true, message: t('drinks.validation.categoryRequired') }]}
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

export function DrinkStatusField({ required = true }: { required?: boolean }) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="status"
      label={t('drinks.status')}
      rules={required ? [{ required: true }] : undefined}
    >
      <Select
        options={[
          { value: 1, label: t('drinks.statusActive') },
          { value: 0, label: t('drinks.statusInactive') },
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

interface DrinkPriceInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const THOUSANDS_SEPARATOR = '.';

function cleanPriceDigits(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function formatPriceWithDots(value: string): string {
  if (!value) return '';
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
}

export function DrinkPriceInput({ value = '', onChange, ...props }: DrinkPriceInputProps) {
  const inputRef = useRef<InputRef>(null);
  const isComposingRef = useRef(false);
  const [compositionValue, setCompositionValue] = useState<string | null>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (
      isComposingRef.current ||
      event.nativeEvent.isComposing ||
      event.key === 'Process' ||
      event.keyCode === 229
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
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    const isShortcut =
      (event.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) ||
      (event.metaKey && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase()));

    if (allowedKeys.includes(event.key) || isShortcut) return;
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  };

  const commitValue = (rawValue: string, inputElement: HTMLInputElement) => {
    const oldCaret = inputElement.selectionStart ?? rawValue.length;
    const digitsBeforeCaret = rawValue.slice(0, oldCaret).replace(/\D/g, '').length;
    const rawDigits = cleanPriceDigits(rawValue);
    const formatted = formatPriceWithDots(rawDigits);

    onChange?.(rawDigits);

    requestAnimationFrame(() => {
      if (!inputRef.current?.input) return;

      let newCaret = 0;
      let countedDigits = 0;
      for (let index = 0; index < formatted.length; index++) {
        if (formatted[index] !== THOUSANDS_SEPARATOR) countedDigits++;
        if (countedDigits === digitsBeforeCaret) {
          newCaret = index + 1;
          break;
        }
      }

      if (digitsBeforeCaret === 0) {
        newCaret = 0;
      } else if (countedDigits < digitsBeforeCaret) {
        newCaret = formatted.length;
      }

      inputRef.current.input.setSelectionRange(newCaret, newCaret);
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const nativeEvent = event.nativeEvent;
    if (isComposingRef.current || (nativeEvent instanceof InputEvent && nativeEvent.isComposing)) {
      setCompositionValue(rawValue);
      return;
    }

    setCompositionValue(null);
    commitValue(rawValue, event.target);
  };

  const handleCompositionStart = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = true;
    setCompositionValue(event.currentTarget.value);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    setCompositionValue(null);
    commitValue(event.currentTarget.value, event.currentTarget);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    props.onPaste?.(event);
    if (event.defaultPrevented) return;

    const pastedValue = event.clipboardData.getData('text');
    if (/[\D]/.test(pastedValue)) {
      event.preventDefault();
      const pastedDigits = cleanPriceDigits(pastedValue);
      if (pastedDigits) onChange?.(pastedDigits);
    }
  };

  const displayValue =
    compositionValue ?? formatPriceWithDots(cleanPriceDigits(String(value ?? '')));

  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      suffix="đ"
      placeholder="35.000"
    />
  );
}
