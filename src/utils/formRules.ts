import type { FormRule } from 'antd';
import type { TFunction } from 'i18next';

// Keep digits only, at most 11 (phone numbers are 10 – 11 digits)
export function normalizePhoneNumber(value?: string): string {
  return value ? value.replace(/\D/g, '').slice(0, 11) : '';
}

// Phone number rule of the backend: starts with 0, 10 – 11 digits (empty is left to `required`)
export function getPhoneNumberRule(t: TFunction): FormRule {
  return {
    validator: (_, value?: string) => {
      const phoneNumber = value?.trim();

      if (!phoneNumber) return Promise.resolve();
      if (!phoneNumber.startsWith('0')) return Promise.reject(new Error(t('responses.EV008')));
      if (phoneNumber.length < 10 || phoneNumber.length > 11) {
        return Promise.reject(new Error(t('responses.EV009')));
      }

      return Promise.resolve();
    },
  };
}
