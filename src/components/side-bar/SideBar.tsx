import { Layout, Menu, Typography, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

interface SideBarProps {
  items: MenuProps['items'];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onBreakpoint?: (broken: boolean) => void;
}

export function SideBar({ items, collapsed = false, onCollapse, onBreakpoint }: SideBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      onBreakpoint={onBreakpoint}
      theme="light"
      className="sticky! top-16 h-[calc(100vh-64px)] self-start shadow-md! flex flex-col"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
          className="flex-1 overflow-auto border-r-0"
        />
        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Typography.Text className="text-gray-400 text-xs block text-center">
              &copy; {new Date().getFullYear()} {t('common.appName')}
            </Typography.Text>
          </div>
        )}
      </div>
    </Sider>
  );
}
