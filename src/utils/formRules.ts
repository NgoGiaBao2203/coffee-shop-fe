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

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
const NO_WHITESPACE_PATTERN = /^\S*$/;
const ASCII_PATTERN = /^[\x21-\x7E]*$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~]).*$/;

// New password rules of the backend, one message at a time in the order
// whitespace (EV013) > non-ASCII (EV015) > min 8 (EV002) > max 72 (EV005) > strength (EV014)
export function getNewPasswordRules(t: TFunction): FormRule[] {
  return [
    { required: true, message: t('profile.newPasswordRequired') },
    {
      validator: (_, value?: string) => {
        if (!value) return Promise.resolve();

        let message: string | undefined;
        if (!NO_WHITESPACE_PATTERN.test(value)) message = t('responses.EV013');
        else if (!ASCII_PATTERN.test(value)) message = t('responses.EV015');
        else if (value.length < PASSWORD_MIN_LENGTH) message = t('profile.newPasswordMin');
        else if (value.length > PASSWORD_MAX_LENGTH) message = t('profile.newPasswordMax');
        else if (!STRONG_PASSWORD_PATTERN.test(value)) message = t('responses.EV014');

        return message ? Promise.reject(new Error(message)) : Promise.resolve();
      },
    },
  ];
}

// Confirm password: required and equal to the field `newPasswordField`
export function getConfirmPasswordRules(t: TFunction, newPasswordField: string): FormRule[] {
  return [
    { required: true, message: t('profile.confirmPasswordRequired') },
    ({ getFieldValue }) => ({
      validator: (_, value?: string) =>
        !value || value === getFieldValue(newPasswordField)
          ? Promise.resolve()
          : Promise.reject(new Error(t('profile.confirmPasswordMismatch'))),
    }),
  ];
}
