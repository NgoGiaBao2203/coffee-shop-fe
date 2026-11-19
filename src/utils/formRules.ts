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

const MAX_TEXT_LENGTH = 100;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
const FULL_NAME_PATTERN = /^[\p{L}\p{N} \-&/(),.']+$/u;

// Phone number is required for staff (create and edit)
export function getRequiredPhoneNumberRules(t: TFunction): FormRule[] {
  return [
    { required: true, whitespace: true, message: t('staffs.phoneRequired') },
    getPhoneNumberRule(t),
  ];
}

// Staff full name: required, max 100, letters (with accents), digits, spaces and - & / ( ) , . '
export function getStaffFullNameRules(t: TFunction): FormRule[] {
  return [
    { required: true, whitespace: true, message: t('staffs.fullNameRequired') },
    { max: MAX_TEXT_LENGTH, message: t('staffs.maxLength') },
    { pattern: FULL_NAME_PATTERN, message: t('staffs.fullNameInvalid') },
  ];
}

// Staff username: required, max 100, unaccented letters, digits and . _ -
export function getStaffUsernameRules(t: TFunction): FormRule[] {
  return [
    { required: true, whitespace: true, message: t('staffs.usernameRequired') },
    { max: MAX_TEXT_LENGTH, message: t('staffs.maxLength') },
    { pattern: USERNAME_PATTERN, message: t('staffs.usernameInvalid') },
  ];
}

// Staff email: required, max 100, valid format
export function getStaffEmailRules(t: TFunction): FormRule[] {
  return [
    { required: true, whitespace: true, message: t('staffs.emailRequired') },
    { max: MAX_TEXT_LENGTH, message: t('staffs.maxLength') },
    { type: 'email', message: t('staffs.emailInvalid') },
  ];
}
