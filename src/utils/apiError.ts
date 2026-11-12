import axios from 'axios';
import i18n from '@/configs/i18n';
import { BACKEND_MESSAGE_RULES, type BackendMessageRule } from '@/constants/backendMessages';
import { RESPONSE_CODE } from '@/constants/messages';
import type { ApiErrorDetail, ApiErrorResponse } from '@/types/api';
import { getResponseMessage } from '@/utils/getResponseMessage';

export interface ApiFieldError {
  name: (string | number)[];
  errors: string[];
}

export function getApiErrorResponse(error: unknown): ApiErrorResponse | undefined {
  return axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.data : undefined;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return getApiErrorResponse(error)?.code;
}

function getErrorDetails(response?: ApiErrorResponse): ApiErrorDetail[] {
  return Array.isArray(response?.errorDetails) ? response.errorDetails : [];
}

// Rule for the response message, or for a detail without field (e.g. { errorCode: 'ER005' })
function findBackendMessageRule(error: unknown): BackendMessageRule | undefined {
  const response = getApiErrorResponse(error);
  const messages = [
    response?.message,
    ...getErrorDetails(response)
      .filter((detail) => !detail.field)
      .map((detail) => detail.message),
  ]
    .filter((message): message is string => typeof message === 'string')
    .map((message) => message.toLowerCase());

  return BACKEND_MESSAGE_RULES.find((rule) =>
    rule.match.some((fragment) => messages.some((message) => message.includes(fragment))),
  );
}

// Vietnamese message for an API error: known backend message first, then the response code
export function getApiErrorMessage(error: unknown): string {
  const rule = findBackendMessageRule(error);

  if (rule) return i18n.t(rule.key);

  return getResponseMessage(getApiErrorCode(error) ?? RESPONSE_CODE.INTERNAL_SERVER_ERROR);
}

// True when the data on screen is stale (not found / changed by another request) and must be reloaded
export function isApiReloadError(error: unknown): boolean {
  return (
    getApiErrorCode(error) === RESPONSE_CODE.NOT_FOUND || !!findBackendMessageRule(error)?.reload
  );
}

// "items[0].quantity" -> ['items', 0, 'quantity'] (Ant Design name path)
function toNamePath(field: string): (string | number)[] {
  return field
    .split(/[.[\]]/)
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

// Form errors for an API error: EV codes on errorDetails[].field, or a known message bound to a field
export function getApiFieldErrors(error: unknown): ApiFieldError[] {
  const rule = findBackendMessageRule(error);

  if (rule?.field) return [{ name: [rule.field], errors: [i18n.t(rule.key)] }];

  return getErrorDetails(getApiErrorResponse(error))
    .filter((detail): detail is ApiErrorDetail & { field: string } => !!detail.field)
    .map((detail) => ({
      name: toNamePath(detail.field),
      errors: [getResponseMessage(detail.message)],
    }));
}
