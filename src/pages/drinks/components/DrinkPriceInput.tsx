import { useRef, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from 'react';
import { Input, type InputProps, type InputRef } from 'antd';

interface DrinkPriceInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const THOUSANDS_SEPARATOR = '.';

function cleanDigits(val: string): string {
  return val.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function formatNumberWithDots(val: string): string {
  if (!val) return '';
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
}

export function DrinkPriceInput({ value = '', onChange, ...props }: DrinkPriceInputProps) {
  const inputRef = useRef<InputRef>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(e);
    if (e.defaultPrevented) return;

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

    if (
      allowedKeys.includes(e.key) ||
      (e.ctrlKey === true && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) ||
      (e.metaKey === true && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const inputElement = e.target;
    const oldCaret = inputElement.selectionStart ?? rawVal.length;

    const digitsBeforeCaret = rawVal.slice(0, oldCaret).replace(/\D/g, '').length;

    const rawDigits = cleanDigits(rawVal);
    const formatted = formatNumberWithDots(rawDigits);

    onChange?.(rawDigits);

    requestAnimationFrame(() => {
      if (!inputRef.current?.input) return;

      let newCaret = 0;
      let countedDigits = 0;

      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== THOUSANDS_SEPARATOR) {
          countedDigits++;
        }
        if (countedDigits === digitsBeforeCaret) {
          newCaret = i + 1;
          break;
        }
      }

      if (countedDigits < digitsBeforeCaret || newCaret === 0) {
        newCaret = formatted.length;
      }

      inputRef.current.input.setSelectionRange(newCaret, newCaret);
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    props.onPaste?.(e);
    if (e.defaultPrevented) return;

    const pastedData = e.clipboardData.getData('text');
    if (/[^\d.,]/.test(pastedData)) {
      e.preventDefault();
      const cleanPasted = cleanDigits(pastedData);
      if (cleanPasted) {
        onChange?.(cleanPasted);
      }
    }
  };

  const displayValue = formatNumberWithDots(cleanDigits(String(value ?? '')));

  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onPaste={handlePaste}
      suffix="đ"
      placeholder="35.000"
    />
  );
}
