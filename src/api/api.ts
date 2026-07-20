import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import { ENV } from '@/constants/evn';
import { RESPONSE_CODE } from '@/constants/messages';
import { store } from '@/store/store';
import { clearProfile } from '@/store/authSlice';
import { getResponseMessage } from '@/utils/getResponseMessage';

interface ApiErrorDetail {
  field: string;
  message: string;
}

interface ApiResponseBody {
  code?: string;
  errorDetails?: ApiErrorDetail[] | null;
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

// Response interceptor — map backend response code to translated message
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponseBody>) => {
    const code = error.response?.data?.code ?? RESPONSE_CODE.INTERNAL_SERVER_ERROR;

    if (error.response?.status === 401) {
      store.dispatch(clearProfile());
    }

    // Validation errors (ER008) are handled at the call site with field-level messages
    if (code !== RESPONSE_CODE.INVALID_REQUEST) {
      notification.error({
        message: 'Lỗi',
        description: getResponseMessage(code),
        placement: 'topRight',
        duration: 3,
      });
    }

    return Promise.reject(error);
  },
);
