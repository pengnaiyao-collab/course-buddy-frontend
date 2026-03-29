import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Typography,
  Input,
  Button,
  Avatar,
  Card,
  Select,
  Spin,
  Space,
  Breadcrumb,
  Tooltip,
  Tag,
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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const courseId = Number(localStorage.getItem('selectedCourseId') || 1);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [latestSources, setLatestSources] = useState([]);
  const [qaMode, setQaMode] = useState('private');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messageContentRef = useRef('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (qaMode === 'web') {
      setLatestSources([]);
    }
  }, [qaMode]);

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
      const response = await streamQuestion({
        question: trimmed,
        conversationId,
        courseId,
        includeKnowledgeContext: qaMode === 'private',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check if it's a streaming response
      const contentType = response.headers.get('content-type') || '';
      console.log('[QA] Response content-type:', contentType);
      
      if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
        // Server-Sent Events / NDJSON streaming
        if (!response.body) {
          throw new Error('Streaming not supported in this environment');
        }

        console.log('[QA] Starting SSE stream...');
        let tokenCount = 0;
        const streamStartTime = Date.now();
        messageContentRef.current = ''; // Reset ref for this new response
        console.log('[QA] Setting streamingId to:', assistantId);
        setStreamingId(assistantId);
        console.log('[QA] Adding message placeholder for id:', assistantId);
        setMessages((prev) => {
          const updated = [...prev, { id: assistantId, role: 'assistant', content: '' }];
          console.log('[QA] Messages after adding placeholder:', updated);
          return updated;
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamTimeout;
        const STREAM_TIMEOUT = 30000; // 30 seconds timeout
        
        const resetTimeout = () => {
          clearTimeout(streamTimeout);
          streamTimeout = setTimeout(() => {
            console.warn('[QA] ⏱️ Stream timeout - forcing completion');
            reader.cancel();
            // Force finalize the message
            const finalContent = messageContentRef.current;
            if (finalContent) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: finalContent } : m))
              );
            }
            setStreamingId(null);
            setLoading(false);
          }, STREAM_TIMEOUT);
        };
        
        resetTimeout();

        const handleBlock = (block) => {
          resetTimeout(); // Reset timeout whenever we receive data
          if (!block) return;
          
          console.log('[QA] Processing SSE block:', block.substring(0, 100));
          
          let eventType = 'message';
          const dataLines = [];
          
          // Parse SSE format: event: xxx\ndata: yyy
          block.split('\n').forEach((line) => {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
          });

          if (dataLines.length === 0) return;
          const payloadStr = dataLines.join('\n');
          console.log('[QA] Event type:', eventType, 'Payload:', payloadStr.substring(0, 100));

          if (eventType === 'done') {
            clearTimeout(streamTimeout);
            console.log('[QA] ✅ Stream complete! Total tokens:', tokenCount, 'Time:', Date.now() - streamStartTime, 'ms');
            
            // CRITICAL: Save message content FIRST before clearing streamingId
            const finalContent = messageContentRef.current;
            console.log('[QA] Saving final content before clearing streamingId. Length:', finalContent.length);
            
            // Force synchronous update
            setMessages((prev) => {
              const updated = prev.map((m) => {
                if (m.id === assistantId) {
                  console.log('[QA] Updating assistantId', assistantId, 'with content length:', finalContent.length);
                  return { ...m, content: finalContent };
                }
                return m;
              });
              return updated;
            });
            
            // Parse done payload
            try {
              const payload = JSON.parse(payloadStr);
              console.log('[QA] Done event payload:', payload);
              if (payload.conversationId) setConversationId(payload.conversationId);
              if (Array.isArray(payload.sources)) setLatestSources(payload.sources);
            } catch (e) {
              console.warn('SSE done parse failed:', payloadStr, e);
            }
            
            // ONLY THEN clear streaming state
            setStreamingId(null);
            return;
          }

          // Try to parse as JSON first, if it fails treat as plain text token
          try {
            const parsed = JSON.parse(payloadStr);
            // If it's a JSON object with content/token/text fields
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.conversationId) setConversationId(parsed.conversationId);
              if (Array.isArray(parsed.sources)) setLatestSources(parsed.sources);
              const token = parsed.content || parsed.token || parsed.text || '';
              messageContentRef.current += token;
              tokenCount++;
            } else {
              // JSON but not an object, treat as string
              messageContentRef.current += String(parsed);
              tokenCount++;
            }
          } catch (parseErr) {
            // Not JSON, treat as plain text token
            if (payloadStr && payloadStr !== '[DONE]') {
              console.log('[QA] Plain text token:', payloadStr);
              messageContentRef.current += payloadStr;
              tokenCount++;
            }
          }

          // Update UI less frequently - every 5 tokens or when significant content accumulated
          if (tokenCount % 5 === 0 || messageContentRef.current.length > 100) {
            console.log('[QA] Updating message UI - tokens:', tokenCount, 'content length:', messageContentRef.current.length);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: messageContentRef.current } : m))
            );
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            clearTimeout(streamTimeout);
            break;
          }

          resetTimeout(); // Reset timeout on each chunk received
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newlines
          // Split by \n\n to get complete blocks
          let startIndex = 0;
          let blockEndIndex;
          
          while ((blockEndIndex = buffer.indexOf('\n\n', startIndex)) !== -1) {
            const block = buffer.slice(startIndex, blockEndIndex).trim();
            if (block) {
              handleBlock(block);
            }
            startIndex = blockEndIndex + 2;
          }
          
          // Keep remaining data in buffer
          buffer = buffer.slice(startIndex);
        }

        // Flush any remaining buffered block
        if (buffer.trim()) {
          console.log('[QA] Flushing remaining buffer:', buffer.trim().substring(0, 50));
          handleBlock(buffer.trim());
        }

        clearTimeout(streamTimeout);

        // If nothing came through the stream, fall back to non-streaming call
        console.log('[QA] Final message content length:', messageContentRef.current.length);
        if (messageContentRef.current.length === 0) {
          console.warn('[QA] ⚠️ Stream returned empty payload, using fallback');
          throw new Error('Stream returned empty payload');
        }
        
        // Ensure final message is saved
        console.log('[QA] Performing final message save...');
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.id === assistantId) {
              console.log('[QA] Final save - updating assistantId', assistantId, 'content length:', messageContentRef.current.length);
              return { ...m, content: messageContentRef.current };
            }
            return m;
          });
          console.log('[QA] ✅ All messages updated:', updated);
          return updated;
        });
        console.log('[QA] Stream processing completed successfully');
      } else {
        // Regular JSON response
        const data = await response.json();
        const payload = data?.data || data;
        const content = payload.answer || payload.content || payload.message || JSON.stringify(payload);
        if (payload.conversationId) setConversationId(payload.conversationId);
        setLatestSources(payload.sources || []);
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content }]);
      }
    } catch (streamErr) {
      // Fall back to regular (non-streaming) API or show error if that also fails
      if (streamTimeout) clearTimeout(streamTimeout);
      console.error('[QA] SSE Stream error:', streamErr);
      const fallback = async () => {
        console.log('[QA] Falling back to non-streaming API...');
        const res = await askQuestion({
          question: trimmed,
          conversationId,
          courseId,
          includeKnowledgeContext: qaMode === 'private',
        });
        const payload = res.data?.data || res.data;
        const content = payload?.answer || payload?.content || payload?.message || 'No response received.';
        if (payload?.conversationId) setConversationId(payload.conversationId);
        setLatestSources(payload?.sources || []);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantId),
          { id: assistantId, role: 'assistant', content },
        ]);
      };

      try {
        await fallback();
      } catch (fallbackErr) {
        console.error('[QA] Fallback also failed:', fallbackErr);
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
  }, [input, loading, conversationId, courseId, qaMode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setConversationId(null);
    setLatestSources([]);
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
                <Select
                  size="small"
                  style={{ width: 180 }}
                  value={qaMode}
                  onChange={setQaMode}
                  options={[
                    { value: 'private', label: '私域知识库模式' },
                    { value: 'web', label: '全网合规模式' },
                  ]}
                />
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

          {latestSources.length > 0 && (
            <Card size="small" style={{ marginBottom: 12, background: '#fafafa' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Knowledge Sources</Text>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {latestSources.map((s) => (
                  <Tag
                    key={s.knowledgeItemId}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/kb/knowledge?itemId=${s.knowledgeItemId}&snippet=${encodeURIComponent(s.snippet || '')}`)}
                  >
                    K{s.knowledgeItemId}: {s.title}
                  </Tag>
                ))}
              </div>
            </Card>
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
