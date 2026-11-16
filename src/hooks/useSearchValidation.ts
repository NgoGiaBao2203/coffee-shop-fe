import { useTranslation } from 'react-i18next';
import { useNotifyModal } from '@/components/modal/NotifyModal';

const SEARCH_MAX_LENGTH = 100;
// Same rule as the backend: letters, digits, spaces and - & / ( ) , . '
const SEARCH_REGEX = /^[\p{L}\p{N}\s\-&/(),.']*$/u;

// Validates a search keyword before the request; shows the error modal and returns false when invalid
export function useSearchValidation() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();

  return (keyword: string): boolean => {
    const trimmed = keyword.trim();

    if (trimmed.length > SEARCH_MAX_LENGTH) {
      showError(t('responses.EV005'), t('common.error'));
      return false;
    }
    if (trimmed && !SEARCH_REGEX.test(trimmed)) {
      showError(t('responses.EV007'), t('common.error'));
      return false;
    }
    return true;
  };
}
