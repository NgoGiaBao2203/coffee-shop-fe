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
import type {
  CreateDrinkDetailRequest,
  DeleteDrinkDetailRequest,
  EditDrinkDetailRequest,
} from '../types';

interface ApiErrorDetail {
  errorCode?: string;
}

interface ApiErrorResponse {
  code?: string;
  errorDetails?: ApiErrorDetail[];
}

// Get readable error message from drink detail API response
function getDrinkDetailApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return getResponseMessage(RESPONSE_CODE.INVALID_REQUEST);
  }

  const response = error.response?.data as ApiErrorResponse | undefined;

  const errorDetails = Array.isArray(response?.errorDetails) ? response.errorDetails : [];

  // Prefer validation detail code when available
  const detailCode = errorDetails[0]?.errorCode;
  const errorCode = detailCode || response?.code;

  return getResponseMessage(errorCode || RESPONSE_CODE.INVALID_REQUEST);
}

export function useDrinkDetails() {
  const { t } = useTranslation();
  const toast = useToast();

  // Loading states for drink detail CRUD actions
  const [createDetailLoading, setCreateDetailLoading] = useState(false);
  const [editDetailLoading, setEditDetailLoading] = useState(false);
  const [deleteDetailLoading, setDeleteDetailLoading] = useState(false);

  // Create a new drink detail
  const createDrinkDetail = useCallback(
    async (payload: CreateDrinkDetailRequest) => {
      setCreateDetailLoading(true);

      try {
        await createDrinkDetailApi(payload);
        toast.success(t('drinkDetails.createSuccess'));
      } catch (error) {
        // Show API validation or request error
        toast.error(getDrinkDetailApiErrorMessage(error));
        throw error;
      } finally {
        setCreateDetailLoading(false);
      }
    },
    [t, toast],
  );

  // Update an existing drink detail
  const editDrinkDetail = useCallback(
    async (payload: EditDrinkDetailRequest) => {
      setEditDetailLoading(true);

      try {
        await editDrinkDetailApi(payload);
        toast.success(t('drinkDetails.editSuccess'));
      } catch (error) {
        // Show API validation or request error
        toast.error(getDrinkDetailApiErrorMessage(error));
        throw error;
      } finally {
        setEditDetailLoading(false);
      }
    },
    [t, toast],
  );

  // Delete an existing drink detail
  const deleteDrinkDetail = useCallback(
    async (payload: DeleteDrinkDetailRequest) => {
      setDeleteDetailLoading(true);

      try {
        await deleteDrinkDetailApi(payload);
        toast.success(t('drinkDetails.deleteSuccess'));
      } catch (error) {
        // Show API validation or request error
        toast.error(getDrinkDetailApiErrorMessage(error));
        throw error;
      } finally {
        setDeleteDetailLoading(false);
      }
    },
    [t, toast],
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
