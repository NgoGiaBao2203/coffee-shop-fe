import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import i18n from 'i18next';
import { ENV } from '@/constants/evn';
import { RESPONSE_CODE } from '@/constants/messages';
import { store } from '@/store/store';
import { clearProfile } from '@/store/authSlice';
import type { ApiErrorResponse } from '@/types/api';
import { getApiErrorMessage } from '@/utils/apiError';

declare module 'axios' {
  interface AxiosRequestConfig {
    suppressCodes?: string[];
  }
  interface InternalAxiosRequestConfig {
    suppressCodes?: string[];
  }
}

export const api = axios.create({
  baseURL: ENV.API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach X-User-Id (profileId) from Redux store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const profileId = store.getState().auth.profile?.profileId;
    if (profileId) {
      config.headers['X-User-Id'] = profileId;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — show the localized error unless the call site handles that code itself
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Fall back to INTERNAL_SERVER_ERROR if response is undefined (e.g. backend offline or network down)
    const code = error.response?.data?.code ?? RESPONSE_CODE.INTERNAL_SERVER_ERROR;

    if (error.response?.status === 401) {
      store.dispatch(clearProfile());
    }

    // Retrieve localized error title from i18n translation resources
    const errorTitle = i18n.t('common.error');

    // Pass `suppressCodes` when the call site renders the error itself (e.g. field-level ER008)
    const suppressCodes = error.config?.suppressCodes ?? [];
    if (!suppressCodes.includes(code)) {
      const description = getApiErrorMessage(error);

      notification.error({
        key: `api_error_${code}_${description}`,
        title: errorTitle,
        description,
        placement: 'topRight',
        duration: 3,
      });
    }

    return Promise.reject(error);
  },
);
