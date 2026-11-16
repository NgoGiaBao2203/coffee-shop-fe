import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd';
import { useAppDispatch } from '@/store/hooks';
import { setProfile } from '@/store/authSlice';
import { useToast } from '@/components/toast/useToast';
import { getProfileApi } from '../api/profileApi';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { getApiErrorCode, getApiFieldErrors } from '@/utils/apiError';
import { getHomePath } from '@/permission/roles';
import type { LoginRequest } from '../types';

export function useLogin(form: FormInstance<LoginRequest>) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const login = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const profileResponse = await getProfileApi(values);
      dispatch(setProfile(profileResponse.userProfile));
      toast.success(t('login.toastSuccess'));
      navigate(getHomePath(profileResponse.userProfile.roleName), { replace: true });
    } catch (error) {
      const code = getApiErrorCode(error);

      if (code === RESPONSE_CODE.INVALID_REQUEST) {
        (form as FormInstance).setFields(getApiFieldErrors(error));
      } else if (code === RESPONSE_CODE.EMAIL_OR_PASSWORD_INCORRECT) {
        // "Username not found" and "Invalid password" share one message
        const message = getResponseMessage(code);
        form.setFields([
          { name: 'username', errors: [message] },
          { name: 'password', errors: [message] },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
