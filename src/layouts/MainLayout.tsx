import { useState } from 'react';
import { Layout, Typography } from 'antd';
import {
  CoffeeOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SideBar } from '@/components/side-bar/SideBar';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { useNavItems } from '@/permission/useNavItems';

const { Header, Content } = Layout;

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { key: '/', label: t('sidebar.drinks'), icon: <CoffeeOutlined /> },
    { key: '/orders', label: t('sidebar.orders'), icon: <ShoppingCartOutlined /> },
    { key: '/categories', label: t('sidebar.categories'), icon: <AppstoreOutlined /> },
    { key: '/revenue', label: t('sidebar.revenues'), icon: <LineChartOutlined /> },
    { key: '/staff', label: t('sidebar.staffs'), icon: <TeamOutlined /> },
    { key: '/branch-shop', label: t('sidebar.branchShops'), icon: <ShopOutlined /> },
  ];

  const navItems = useNavItems(NAV_ITEMS);

  return (
    <Layout className="min-h-screen">
      <Header
        className="flex items-center justify-between px-4 md:px-8 sticky! top-0 z-10"
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Typography.Title
          level={4}
          className="text-white! mb-0! tracking-wide truncate max-w-[160px] md:max-w-none"
        >
          {collapsed ? t('common.appNameShort') : t('common.appName')}
        </Typography.Title>
        <ProfileDropdown />
      </Header>

      <Layout>
        <SideBar
          items={navItems}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onBreakpoint={(broken) => setCollapsed(broken)}
        />

        <Layout>
          <Content
            className="p-4 overflow-hidden"
            style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
