import React from 'react';
import { Dropdown, Avatar, Typography, Space } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';

const { Text } = Typography;

function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('nav.profile'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.signOut'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <div className="flex items-center gap-2 cursor-pointer select-none" style={{ padding: '4px 8px' }}>
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <Text style={{ color: '#fff', fontSize: 14 }}>{user?.username || 'User'}</Text>
        <DownOutlined style={{ color: '#fff', fontSize: 11 }} />
      </div>
    </Dropdown>
  );
}

export default UserMenu;
