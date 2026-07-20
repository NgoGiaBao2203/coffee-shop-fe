import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { LoginForm } from './components/LoginForm';
import './styles/login.css';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="p-2">
      <Typography.Title level={3} className="login-title">
        {t('login.title')}
      </Typography.Title>
      <LoginForm />
    </div>
  );
}
