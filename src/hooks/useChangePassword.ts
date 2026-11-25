import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changePasswordApi } from '@/api/profileApi';
import { useToast } from '@/components/toast/useToast';
import type { ChangePasswordRequest } from '@/types/profile';

// State of the "Change password" modal opened from the profile dropdown.
// Errors are rethrown so the modal can show them on its fields; the session stays valid on success.
export function useChangePassword() {
  const { t } = useTranslation();
  const toast = useToast();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const handleOpenChangePassword = useCallback(() => setShowChangePasswordModal(true), []);
  const handleCloseChangePassword = useCallback(() => setShowChangePasswordModal(false), []);

  const handleChangePassword = async (values: ChangePasswordRequest) => {
    setChangePasswordLoading(true);
    try {
      await changePasswordApi(values);
      toast.success(t('profile.changePasswordSuccess'));
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return {
    showChangePasswordModal,
    changePasswordLoading,
    handleOpenChangePassword,
    handleCloseChangePassword,
    handleChangePassword,
  };
}
