import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import {
  createDrinkDetailApi,
  deleteDrinkDetailApi,
  editDrinkDetailApi,
} from '../api/drinkDetailsAPI';

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
      } finally {
        // Create / edit errors are shown on the size form, delete errors by the interceptor
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
