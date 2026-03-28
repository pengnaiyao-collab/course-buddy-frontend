import React, { useState } from 'react';
import { Dropdown, Badge, List, Button, Empty, Typography, Space, Divider } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { markNotificationRead, markAllRead, removeNotification } from '../../store/slices/notificationsSlice';
import { markNotificationRead as apiMarkRead } from '../../services/api/notifications';

const { Text } = Typography;

function NotificationBell() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    dispatch(markNotificationRead(id));
    try { await apiMarkRead(id); } catch { /* ignore */ }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const previewItems = items.slice(0, 5);

  const dropdownContent = (
    <div
      style={{
        width: 340,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Text strong style={{ color: 'var(--text-primary)' }}>
          {t('notifications.title')}
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>
      {previewItems.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('notifications.noNotifications')}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <List
          dataSource={previewItems}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '10px 16px',
                background: item.read ? 'transparent' : 'var(--active-bg)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              actions={[
                !item.read && (
                  <Button
                    key="read"
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => handleMarkRead(e, item.id)}
                  />
                ),
                <Button
                  key="del"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDelete(e, item.id)}
                />,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <Space size={4}>
                    {!item.read && <Badge status="processing" />}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: item.read ? 400 : 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.title}
                    </Text>
                  </Space>
                }
                description={
                  <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {item.content}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: '8px 16px', textAlign: 'center' }}>
        <Button
          type="link"
          size="small"
          onClick={() => { setOpen(false); navigate('/notifications'); }}
        >
          {t('common.more')}
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18, color: '#fff' }} />}
          style={{ padding: '4px 8px' }}
        />
      </Badge>
    </Dropdown>
  );
}

export default NotificationBell;
