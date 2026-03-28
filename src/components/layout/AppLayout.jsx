import React from 'react';
import { Layout, Typography, Avatar, Button, Dropdown } from 'antd';
import {
  BookOutlined,
  DatabaseOutlined,
  RobotOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { path: '/courses', label: 'Course Library', icon: <BookOutlined /> },
  { path: '/kb', label: 'Knowledge Base', icon: <DatabaseOutlined />, subPaths: ['/kb/'] },
  { path: '/qa', label: 'Q&A Assistant', icon: <RobotOutlined /> },
  { path: '/ai', label: 'AI Generation', icon: <ThunderboltOutlined /> },
  { path: '/collaboration', label: 'Collaboration', icon: <TeamOutlined /> },
  { path: '/notes', label: 'My Notes', icon: <FileTextOutlined /> },
];

function AppLayout({ children, activeKey }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (item) => {
    if (activeKey) return activeKey === item.path;
    if (location.pathname === item.path) return true;
    if (item.subPaths) {
      return item.subPaths.some((sp) => location.pathname.startsWith(sp));
    }
    return false;
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1677ff',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/courses')}
        >
          <BookOutlined style={{ color: '#fff', fontSize: 22, marginRight: 10 }} />
          <Text strong style={{ color: '#fff', fontSize: 18 }}>
            CourseBuddy
          </Text>
        </div>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
            <Text style={{ color: '#fff' }}>{user?.username || 'User'}</Text>
            <DownOutlined style={{ color: '#fff', fontSize: 11 }} />
          </div>
        </Dropdown>
      </Header>

      <Layout>
        <Sider
          width={220}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
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
                    color: active ? '#1677ff' : '#374151',
                    background: active ? '#e6f4ff' : 'transparent',
                    borderRight: active ? '3px solid #1677ff' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </Sider>

        <Content style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
