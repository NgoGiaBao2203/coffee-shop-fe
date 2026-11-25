import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type { ChangePasswordRequest, ChangePasswordResponse } from '@/types/profile';

// Every role can change their own password. ER008 (field / business errors) is shown on the form.
export async function changePasswordApi(
  body: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const response = await api.put<ChangePasswordResponse>(ENDPOINT.CHANGE_PASSWORD, body, {
    suppressCodes: [RESPONSE_CODE.INVALID_REQUEST],
  });
  return response.data;
}
