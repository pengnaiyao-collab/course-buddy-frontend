import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Space, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const { TextArea } = Input;
const { Title } = Typography;

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化时可以获取历史对话，这里为了演示简单，每次打开作为新对话
  // 如果需要加载历史，可以调用 GET /api/v1/ai/conversations/{id}/messages

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 采用同步接口演示
      // 流式接口需要使用 fetch 或 EventSource (SSE) 处理
      const payload: any = {
        message: userMessage.content,
        includeHistory: true,
        includeKnowledgeContext: true,
      };
      
      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const res: any = await request.post('/api/v1/ai/chat', payload);
      const data = res.data || res;
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer || '抱歉，我没有获取到回答',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '服务请求失败，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={<Space><RobotOutlined style={{ color: '#1677ff' }} /> <span>AI 学习助手 (基于讯飞星火)</span></Space>}
      style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: '#f5f5f5' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 100 }}>
            <RobotOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
            <Title level={4} style={{ color: '#666' }}>有什么我可以帮您的？</Title>
            <p>您可以向我提问关于课程、作业或者编程相关的任何问题。</p>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={item => (
              <List.Item style={{ borderBottom: 'none', padding: '12px 0', justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: item.role === 'user' ? 'row-reverse' : 'row', gap: 12 }}>
                  <Avatar 
                    icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                    style={{ backgroundColor: item.role === 'user' ? '#1677ff' : '#52c41a' }}
                  />
                  <div style={{
                    maxWidth: '600px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: item.role === 'user' ? '#1677ff' : '#fff',
                    color: item.role === 'user' ? '#fff' : '#000',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {item.content}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 0' }}>
            <Space align="start">
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
              <Spin style={{ marginLeft: 8, marginTop: 8 }} />
            </Space>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入您的问题 (按 Shift+Enter 换行，Enter 发送)..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSend} 
            loading={loading}
            style={{ height: 'auto' }}
          >
            发送
          </Button>
        </Space.Compact>
      </div>
    </Card>
  );
};

export default AiAssistant;