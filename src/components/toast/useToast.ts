import { App } from 'antd';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotifyOptions {
  title?: string;
  duration?: number;
}

export function useToast() {
  const { notification } = App.useApp();

  const show = (type: NotificationType, description: string, options: NotifyOptions = {}) => {
    const { title, duration = 3 } = options;
    notification[type]({
      title: title,
      description,
      duration,
      placement: 'topRight',
    });
  };

  return {
    success: (description: string, options?: NotifyOptions) =>
      show('success', description, options),
    error: (description: string, options?: NotifyOptions) => show('error', description, options),
    warning: (description: string, options?: NotifyOptions) =>
      show('warning', description, options),
    info: (description: string, options?: NotifyOptions) => show('info', description, options),
  };
}
