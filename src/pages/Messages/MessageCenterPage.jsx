import React, { useEffect, useState, useRef } from 'react';
import {
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Badge,
  Empty,
  Spin,
  Popconfirm,
  message,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  removeMessage,
  markConversationRead,
  setLoading,
} from '../../store/slices/messagesSlice';
import {
  getConversations,
  getMessages,
  sendMessage as apiSend,
  deleteMessage as apiDelete,
  markConversationRead as apiMarkRead,
} from '../../services/api/messages';

const { Title, Text } = Typography;

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'Prof. Chen',
    unreadCount: 2,
    lastMessage: { content: 'Please check the new assignment.', createdAt: new Date().toISOString() },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Study Group',
    unreadCount: 0,
    lastMessage: { content: 'Meeting at 3pm today?', createdAt: new Date(Date.now() - 3600000).toISOString() },
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    name: 'Alice Wang',
    unreadCount: 1,
    lastMessage: { content: 'Can you share your notes?', createdAt: new Date(Date.now() - 7200000).toISOString() },
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, content: 'Hello! Please check the new assignment I uploaded.', senderId: 99, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, content: 'Sure, I will check it right away!', senderId: 1, createdAt: new Date(Date.now() - 3000000).toISOString() },
    { id: 3, content: 'Please check the new assignment.', senderId: 99, createdAt: new Date().toISOString() },
  ],
  2: [
    { id: 4, content: 'Meeting at 3pm today?', senderId: 50, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 5, content: 'Sounds good!', senderId: 1, createdAt: new Date(Date.now() - 3500000).toISOString() },
  ],
  3: [
    { id: 6, content: 'Can you share your notes?', senderId: 51, createdAt: new Date(Date.now() - 7200000).toISOString() },
  ],
};

function MessageCenterPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, activeConversationId, messages, loading } = useSelector(
    (state) => state.messages
  );
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      dispatch(setLoading(true));
      try {
        const res = await getConversations();
        dispatch(setConversations(res.data));
      } catch {
        dispatch(setConversations(MOCK_CONVERSATIONS));
      }
    };
    fetch();
  }, [dispatch]);

  const fetchMessages = async (convId) => {
    if (messages[convId]) return;
    try {
      const res = await getMessages(convId);
      dispatch(setMessages({ conversationId: convId, messages: res.data }));
    } catch {
      dispatch(setMessages({ conversationId: convId, messages: MOCK_MESSAGES[convId] || [] }));
    }
  };

  const handleSelectConversation = async (convId) => {
    dispatch(setActiveConversation(convId));
    dispatch(markConversationRead(convId));
    await fetchMessages(convId);
    try { await apiMarkRead(convId); } catch { /* ignore */ }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConversationId) return;
    const content = inputValue.trim();
    setInputValue('');
    setSending(true);
    const newMsg = {
      id: Date.now(),
      content,
      senderId: user?.id || 1,
      createdAt: new Date().toISOString(),
    };
    dispatch(addMessage({ conversationId: activeConversationId, message: newMsg }));
    try {
      await apiSend(activeConversationId, { content });
    } catch {
      /* optimistic update already applied */
    } finally {
      setSending(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    dispatch(removeMessage({ conversationId: activeConversationId, messageId: msgId }));
    try { await apiDelete(activeConversationId, msgId); } catch { /* ignore */ }
  };

  const currentUserId = user?.id || 1;
  const activeMessages = messages[activeConversationId] || [];
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <AppLayout>
      <div style={{ padding: 0, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
            <MessageOutlined style={{ marginRight: 8 }} />
            {t('messages.title')}
          </Title>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Conversation list */}
          <div
            style={{
              width: 280,
              borderRight: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: '12px' }}>
              <Input
                prefix={<UserOutlined />}
                placeholder={t('messages.searchConversations')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                allowClear
              />
            </div>
            {filteredConvs.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('messages.noConversations')}
                style={{ padding: 24 }}
              />
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredConvs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background:
                        conv.id === activeConversationId
                          ? 'var(--active-bg)'
                          : 'transparent',
                      borderLeft:
                        conv.id === activeConversationId
                          ? '3px solid var(--active-color)'
                          : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Badge count={conv.unreadCount || 0} size="small">
                        <Avatar icon={<UserOutlined />} size={36} />
                      </Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          strong={Boolean(conv.unreadCount)}
                          style={{ color: 'var(--text-primary)', fontSize: 13 }}
                        >
                          {conv.name}
                        </Text>
                        <div>
                          <Text
                            ellipsis
                            style={{
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              display: 'block',
                            }}
                          >
                            {conv.lastMessage?.content || ''}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
            {!activeConversationId ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Empty description={t('messages.selectConversation')} />
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <Text strong style={{ color: 'var(--text-primary)' }}>
                    {activeConv?.name}
                  </Text>
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {activeMessages.length === 0 ? (
                    <Empty description={t('messages.noMessages')} style={{ margin: 'auto' }} />
                  ) : (
                    activeMessages.map((msg) => {
                      const isMine = msg.senderId === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: 8,
                          }}
                        >
                          {!isMine && <Avatar icon={<UserOutlined />} size={28} />}
                          <div
                            style={{
                              maxWidth: '65%',
                              background: isMine ? 'var(--active-color)' : 'var(--bg-elevated)',
                              color: isMine ? '#fff' : 'var(--text-primary)',
                              padding: '8px 14px',
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              fontSize: 14,
                              wordBreak: 'break-word',
                              position: 'relative',
                            }}
                          >
                            {msg.content}
                            {isMine && (
                              <Popconfirm
                                title={t('messages.deleteMessage')}
                                onConfirm={() => handleDeleteMessage(msg.id)}
                                okText={t('common.confirm')}
                                cancelText={t('common.cancel')}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -28,
                                    opacity: 0.6,
                                    fontSize: 11,
                                    color: 'var(--text-secondary)',
                                  }}
                                />
                              </Popconfirm>
                            )}
                          </div>
                          {isMine && (
                            <Avatar
                              icon={<UserOutlined />}
                              size={28}
                              style={{ background: '#1677ff' }}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Input
                    placeholder={t('messages.typeMessage')}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSend}
                    style={{ flex: 1 }}
                    maxLength={2000}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={sending}
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                  >
                    {t('messages.send')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MessageCenterPage;
