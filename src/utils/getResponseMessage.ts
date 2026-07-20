import i18n from '@/configs/i18n';
import { RESPONSE_CODE, type ResponseCode } from '@/constants/messages';

export function getResponseMessage(code: ResponseCode | string): string {
  const key = `responses.${code}`;
  return i18n.exists(key)
    ? i18n.t(key)
    : i18n.t(`responses.${RESPONSE_CODE.INTERNAL_SERVER_ERROR}`);
}
