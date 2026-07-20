import { Dropdown, Avatar, Space, Tag, type MenuProps } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/store/useLogout';

export function ProfileDropdown() {
  const { t } = useTranslation();
  const { logout } = useLogout();
  const profile = useAppSelector((state) => state.auth.profile);

  const items: MenuProps['items'] = [
    {
      key: 'info',
      type: 'group',
      label: (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm text-gray-800">{profile?.fullName}</span>
          <Tag color="blue">{profile?.roleName}</Tag>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'reset-password',
      icon: <LockOutlined />,
      label: t('profile.resetPassword'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('profile.logout'),
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Space className="cursor-pointer select-none rounded-lg px-3 py-1 transition-colors hover:bg-white/10">
        <Avatar
          icon={<UserOutlined />}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 0 2px rgba(139,92,246,0.3)',
          }}
        />
        <span className="hidden sm:inline text-white font-medium">{profile?.username}</span>
      </Space>
    </Dropdown>
  );
}
