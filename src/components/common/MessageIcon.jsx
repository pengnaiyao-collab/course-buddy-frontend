import React, { useState } from 'react';
import { Dropdown, Badge, List, Button, Empty, Typography, Avatar, Divider } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

function MessageIcon() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversations, unreadCount } = useSelector((state) => state.messages);
  const [open, setOpen] = useState(false);

  const previewConvs = conversations.slice(0, 5);

  const dropdownContent = (
    <div
      style={{
        width: 320,
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
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Text strong style={{ color: 'var(--text-primary)' }}>
          {t('messages.title')}
        </Text>
      </div>
      {previewConvs.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('messages.noConversations')}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <List
          dataSource={previewConvs}
          renderItem={(conv) => (
            <List.Item
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: (conv.unreadCount || 0) > 0 ? 'var(--active-bg)' : 'transparent',
              }}
              onClick={() => { setOpen(false); navigate('/messages'); }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={conv.unreadCount || 0} size="small">
                    <Avatar icon={<UserOutlined />} size="small" />
                  </Badge>
                }
                title={
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: (conv.unreadCount || 0) > 0 ? 600 : 400,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {conv.name}
                  </Text>
                }
                description={
                  <Text
                    ellipsis
                    style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}
                  >
                    {conv.lastMessage?.content || ''}
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
          onClick={() => { setOpen(false); navigate('/messages'); }}
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
          icon={<MessageOutlined style={{ fontSize: 18, color: '#fff' }} />}
          style={{ padding: '4px 8px' }}
        />
      </Badge>
    </Dropdown>
  );
}

export default MessageIcon;
