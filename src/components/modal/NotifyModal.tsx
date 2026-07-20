import { App } from 'antd';
import { useTranslation } from 'react-i18next';

export function useNotifyModal() {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const showError = (content: string, title?: string) => {
    modal.error({
      title: title ?? t('common.error'),
      content,
      centered: true,
      okText: t('common.ok'),
    });
  };

  const showInfo = (content: string, title?: string) => {
    modal.info({
      title,
      content,
      centered: true,
      okText: t('common.ok'),
    });
  };

  return { showError, showInfo };
}
