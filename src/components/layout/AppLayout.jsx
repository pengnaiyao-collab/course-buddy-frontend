import React from 'react';
import { Layout, Typography } from 'antd';
import {
  BookOutlined,
  DatabaseOutlined,
  RobotOutlined,
  TeamOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../common/SearchBar';
import NotificationBell from '../common/NotificationBell';
import MessageIcon from '../common/MessageIcon';
import UserMenu from '../common/UserMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeSwitcher from '../common/ThemeSwitcher';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

function AppLayout({ children, activeKey }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: '/courses', labelKey: 'nav.courseLibrary', icon: <BookOutlined /> },
    { path: '/kb', labelKey: 'nav.knowledgeBase', icon: <DatabaseOutlined />, subPaths: ['/kb/'] },
    { path: '/qa', labelKey: 'nav.qaAssistant', icon: <RobotOutlined /> },
    { path: '/ai', labelKey: 'nav.aiGeneration', icon: <ThunderboltOutlined /> },
    { path: '/collaboration', labelKey: 'nav.collaboration', icon: <TeamOutlined /> },
    { path: '/notes', labelKey: 'nav.myNotes', icon: <FileTextOutlined /> },
  ];

  const isActive = (item) => {
    if (activeKey) return activeKey === item.path;
    if (location.pathname === item.path) return true;
    if (item.subPaths) {
      return item.subPaths.some((sp) => location.pathname.startsWith(sp));
    }
    return false;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--header-bg, #1677ff)',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          gap: 12,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          style={{ flexShrink: 0 }}
          onClick={() => navigate('/courses')}
        >
          <BookOutlined style={{ color: '#fff', fontSize: 22, marginRight: 8 }} />
          <Text strong style={{ color: '#fff', fontSize: 18, whiteSpace: 'nowrap' }}>
            CourseBuddy
          </Text>
        </div>

        {/* Search bar — hidden on small screens */}
        <div className="hidden md:flex flex-1 justify-center" style={{ maxWidth: 320 }}>
          <SearchBar />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <NotificationBell />
          <MessageIcon />
          <LanguageSwitcher />
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </Header>

      <Layout>
        <Sider
          width={220}
          style={{
            background: 'var(--sidebar-bg, #fff)',
            borderRight: '1px solid var(--sidebar-border, #f0f0f0)',
          }}
          breakpoint="md"
          collapsedWidth={0}
        >
          <div style={{ padding: '16px 0' }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--active-color, #1677ff)' : 'var(--text-primary, #374151)',
                    background: active ? 'var(--active-bg, #e6f4ff)' : 'transparent',
                    borderRight: active
                      ? '3px solid var(--active-color, #1677ff)'
                      : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--hover-bg, #f5f5f5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                </div>
              );
            })}
          </div>
        </Sider>

        <Content
          style={{
            background: 'var(--bg-secondary, #f5f7fa)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
