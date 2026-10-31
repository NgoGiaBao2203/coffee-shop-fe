import { useCallback, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import {
  createDrinkDetailApi,
  deleteDrinkDetailApi,
  editDrinkDetailApi,
} from '../api/drinkDetailsAPI';

interface ApiErrorDetail {
  errorCode?: string;
}

interface ApiErrorResponse {
  code?: string;
  errorDetails?: ApiErrorDetail[];
}

// Get readable error message from drink detail API response
function getDrinkDetailApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return getResponseMessage(RESPONSE_CODE.INVALID_REQUEST);
  }

  const response = error.response?.data;

  const errorDetails = Array.isArray(response?.errorDetails) ? response.errorDetails : [];

  // Prefer validation detail code when available
  const detailCode = errorDetails[0]?.errorCode;
  const errorCode = detailCode || response?.code;

  return getResponseMessage(errorCode || RESPONSE_CODE.INVALID_REQUEST);
}

// Share mutation handling while keeping each action's loading state independent
function useDrinkDetailMutation<T>(
  request: (payload: T) => Promise<unknown>,
  successMessage: string,
) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (payload: T) => {
      setLoading(true);
      try {
        await request(payload);
        toast.success(successMessage);
      } catch (error) {
        toast.error(getDrinkDetailApiErrorMessage(error));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [request, successMessage, toast],
  );

  return { loading, mutate };
}

export function useDrinkDetails() {
  const { t } = useTranslation();

  const { loading: createDetailLoading, mutate: createDrinkDetail } = useDrinkDetailMutation(
    createDrinkDetailApi,
    t('drinkDetails.createSuccess'),
  );
  const { loading: editDetailLoading, mutate: editDrinkDetail } = useDrinkDetailMutation(
    editDrinkDetailApi,
    t('drinkDetails.editSuccess'),
  );
  const { loading: deleteDetailLoading, mutate: deleteDrinkDetail } = useDrinkDetailMutation(
    deleteDrinkDetailApi,
    t('drinkDetails.deleteSuccess'),
  );

  // Expose drink detail actions and loading states
  return {
    createDetailLoading,
    editDetailLoading,
    deleteDetailLoading,
    createDrinkDetail,
    editDrinkDetail,
    deleteDrinkDetail,
  };
}
