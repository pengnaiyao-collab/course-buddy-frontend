import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Typography,
  Input,
  Button,
  Avatar,
  Card,
  Spin,
  Space,
  Breadcrumb,
  Tooltip,
  message,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  HomeOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { streamQuestion, askQuestion } from '../../services/api/qa';

const { Title, Text } = Typography;
const { TextArea } = Input;

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! I'm your AI learning assistant. Ask me anything about your courses, and I'll do my best to help you understand the concepts.",
  },
];

const SUGGESTED_QUESTIONS = [
  'Explain the concept of Big-O notation',
  'What is the difference between stack and queue?',
  'How does a hash table work?',
  'What are the SOLID principles in OOP?',
];

function QAAssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (questionText) => {
    const trimmed = (questionText || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    const assistantId = Date.now() + 1;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Try streaming first, fall back to regular request
    try {
      abortControllerRef.current = new AbortController();
      const response = await streamQuestion({ question: trimmed });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check if it's a streaming response
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
        // Server-Sent Events / NDJSON streaming
        setStreamingId(assistantId);
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Handle SSE format: "data: ...\n\n"
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const token = parsed.content || parsed.token || parsed.text || '';
                accumulated += token;
              } catch (parseErr) {
                console.warn('SSE parse error, treating as plain text:', parseErr);
                accumulated += data;
              }
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
              );
            }
          }
        }
        setStreamingId(null);
      } else {
        // Regular JSON response
        const data = await response.json();
        const content = data.answer || data.content || data.message || JSON.stringify(data);
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content }]);
      }
    } catch (streamErr) {
      // Fall back to regular (non-streaming) API
      try {
        const res = await askQuestion({ question: trimmed });
        const content = res.data?.answer || res.data?.content || res.data?.message || 'No response received.';
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantId),
          { id: assistantId, role: 'assistant', content },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantId),
          {
            id: assistantId,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please check your connection and try again.',
          },
        ]);
        message.error('Failed to get a response from the AI assistant.');
      }
    } finally {
      setLoading(false);
      setStreamingId(null);
      abortControllerRef.current = null;
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    message.success('Conversation cleared');
  };

  return (
    <AppLayout>
      <div style={{ padding: 24, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Q&A Assistant' },
          ]}
        />

        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 16 } }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <RobotOutlined style={{ color: '#1677ff' }} />
                <span>AI Q&amp;A Assistant</span>
                <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Streaming</Text>
              </Space>
              <Tooltip title="Clear conversation">
                <Button
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClearHistory}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Tooltip>
            </div>
          }
        >
          {/* Suggested questions */}
          {messages.length === 1 && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Suggested questions:</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    size="small"
                    onClick={() => handleSend(q)}
                    style={{ fontSize: 12 }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ background: msg.role === 'user' ? '#1677ff' : '#52c41a', flexShrink: 0 }}
                  />
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      background: msg.role === 'user' ? '#1677ff' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#262626',
                      border: msg.role === 'user' ? 'none' : '1px solid #f0f0f0',
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                    {streamingId === msg.id && (
                      <span className="cursor-blink" />
                    )}
                  </div>
                </div>
              ))}
              {loading && streamingId === null && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar icon={<RobotOutlined />} style={{ background: '#52c41a', flexShrink: 0 }} />
                  <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '4px 18px 18px 18px', padding: '10px 14px' }}>
                    <Spin size="small" />
                    <Text style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 13 }}>Thinking…</Text>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend()}
              loading={loading}
              disabled={!input.trim()}
            >
              Send
            </Button>
          </Space.Compact>
        </Card>
      </div>
    </AppLayout>
  );
}

export default QAAssistantPage;
