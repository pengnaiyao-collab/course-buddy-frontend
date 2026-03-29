import React, { useEffect, useState } from 'react';
import {
  List,
  Button,
  Badge,
  Tag,
  Typography,
  Space,
  Tabs,
  Empty,
  Popconfirm,
  message,
  Spin,
  Alert,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';
import {
  setNotifications,
  markNotificationRead,
  markAllRead,
  removeNotification,
  clearAllNotifications,
  setLoading,
} from '../../store/slices/notificationsSlice';
import {
  getNotifications,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
  deleteNotification as apiDelete,
  clearAllNotifications as apiClearAll,
} from '../../services/api/notifications';
import websocketService from '../../services/ws/websocket';

const { Title, Text } = Typography;

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New course material uploaded',
    content: 'Prof. Chen uploaded new materials for CS101.',
    type: 'course',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 2,
    title: 'Collaboration invite',
    content: 'You were invited to join "Web Dev Project".',
    type: 'collaboration',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 3,
    title: 'System maintenance',
    content: 'Scheduled maintenance on Sunday 2:00-4:00 AM.',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 4,
    title: 'Assignment deadline reminder',
    content: 'Assignment 3 is due in 24 hours.',
    type: 'course',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const TYPE_COLORS = {
  system: 'default',
  course: 'blue',
  collaboration: 'green',
};

function getTimeAgo(t, dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('notifications.justNow');
  if (mins < 60) return t('notifications.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  return t('notifications.daysAgo', { count: Math.floor(hours / 24) });
}

function NotificationCenterPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('all');
  const [wsConnected, setWsConnected] = useState(false);
  const token = localStorage.getItem('token');
  const { user } = useSelector((state) => state.auth);

  const fetchNotifications = async () => {
    dispatch(setLoading(true));
    try {
      const res = await getNotifications();
      dispatch(setNotifications(res.data));
    } catch {
      dispatch(setNotifications(MOCK_NOTIFICATIONS));
    }
  };

  // WebSocket setup for real-time notifications
  useEffect(() => {
    if (!user?.id || !token) return;

    const handleWSConnected = () => {
      setWsConnected(true);
      console.log('WebSocket connected for notifications');
    };

    const handleWSError = (error) => {
      console.error('WebSocket connection error:', error);
      setWsConnected(false);
    };

    websocketService.connect(token, handleWSConnected, handleWSError);

    // Subscribe to notifications queue
    const notificationChannel = `/queue/user/${user.id}/notifications`;
    websocketService.subscribe(notificationChannel, (msg) => {
      console.log('New notification received:', msg);
      try {
        const notificationData = JSON.parse(msg.body);

        // Add new notification to the list
        const newNotification = {
          id: Date.now(),
          title: notificationData.title || 'New Notification',
          content: notificationData.content || '',
          type: notificationData.type || 'system',
          read: false,
          createdAt: new Date().toISOString(),
        };

        // Dispatch action to add notification
        dispatch(setNotifications([newNotification, ...items]));

        // Show notification toast
        message.success(notificationData.title);
      } catch (err) {
        console.warn('Failed to parse notification:', err);
      }
    });

    return () => {
      websocketService.unsubscribe(notificationChannel);
    };
  }, [user?.id, token, dispatch, items]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleMarkRead = async (id) => {
    dispatch(markNotificationRead(id));
    try { await apiMarkRead(id); } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());
    try { await apiMarkAllRead(); } catch { /* ignore */ }
    message.success(t('common.success'));
  };

  const handleDelete = async (id) => {
    dispatch(removeNotification(id));
    try { await apiDelete(id); } catch { /* ignore */ }
  };

  const handleClearAll = async () => {
    dispatch(clearAllNotifications());
    try { await apiClearAll(); } catch { /* ignore */ }
    message.success(t('common.success'));
  };

  const filteredItems = items.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const tabItems = [
    { key: 'all', label: t('notifications.all') },
    { key: 'unread', label: t('notifications.unread') },
    { key: 'system', label: t('notifications.system') },
    { key: 'course', label: t('notifications.course') },
    { key: 'collaboration', label: t('notifications.collaboration') },
  ];

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
              <BellOutlined style={{ marginRight: 8 }} />
              {t('notifications.title')}
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>{t('notifications.subtitle')}</Text>
          </div>
          <Space>
            {wsConnected && (
              <Tag icon={<WifiOutlined />} color="success">
                Real-time On
              </Tag>
            )}
            {!wsConnected && (
              <Tag icon={<DisconnectOutlined />} color="default">
                Offline
              </Tag>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchNotifications}>
              {t('common.refresh')}
            </Button>
            {unreadCount > 0 && (
              <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
                {t('notifications.markAllRead')}
              </Button>
            )}
            {items.length > 0 && (
              <Popconfirm
                title={t('notifications.clearAll')}
                onConfirm={handleClearAll}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('notifications.clearAll')}
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Empty description={t('notifications.noNotifications')} style={{ padding: 48 }} />
        ) : (
          <List
            dataSource={filteredItems}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.read ? 'var(--bg-primary)' : 'var(--active-bg)',
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                }}
                actions={[
                  !item.read && (
                    <Button
                      key="read"
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleMarkRead(item.id)}
                    >
                      {t('notifications.markRead')}
                    </Button>
                  ),
                  <Popconfirm
                    key="del"
                    title={t('notifications.deleteNotification')}
                    onConfirm={() => handleDelete(item.id)}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {!item.read && <Badge status="processing" />}
                      <Text
                        strong={!item.read}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </Text>
                      <Tag color={TYPE_COLORS[item.type] || 'default'}>{item.type}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {item.content}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {getTimeAgo(t, item.createdAt)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default NotificationCenterPage;
