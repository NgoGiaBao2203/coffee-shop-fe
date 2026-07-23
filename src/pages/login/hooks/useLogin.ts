import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd';
import type { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import { setProfile } from '@/store/authSlice';
import { useToast } from '@/components/toast/useToast';
import { getProfileApi } from '../api/profileApi';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import type { LoginRequest, ErrorResponse } from '../types';

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
      navigate('/', { replace: true });
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const data = error.response?.data;
      if (data?.code === RESPONSE_CODE.INVALID_REQUEST && data.errorDetails) {
        form.setFields(
          data.errorDetails.map((detail) => ({
            name: detail.field as keyof LoginRequest,
            errors: [getResponseMessage(detail.message)],
          })),
        );
      } else if (
        data?.code === RESPONSE_CODE.NOT_FOUND ||
        data?.code === RESPONSE_CODE.EMAIL_OR_PASSWORD_INCORRECT
      ) {
        form.setFields([
          { name: 'username', errors: [getResponseMessage(data.code)] },
          { name: 'password', errors: [getResponseMessage(data.code)] },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
