import React, { useState, useRef } from 'react';
import { Button, Input, Space, Spin, Alert, Card, message, Typography, Tag } from 'antd';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { streamQuestion } from '../../services/api/qa';

const { Title, Text, Paragraph } = Typography;

export default function StreamDebugPage() {
  const [question, setQuestion] = useState('你好，请简单介绍一下机器学习');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, streaming, done, error
  const abortRef = useRef(null);

  const handleTest = async () => {
    if (!question.trim()) {
      message.error('请输入问题');
      return;
    }

    setResponse('');
    setEvents([]);
    setLoading(true);
    setStatus('streaming');
    abortRef.current = new AbortController();

    try {
      const response = await streamQuestion({
        question: question.trim(),
        courseId: 1,
        includeKnowledgeContext: false,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      addEvent('info', `Content-Type: ${contentType}`);

      if (contentType.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';
        let eventCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Flush remaining buffer
            if (buffer.trim()) {
              processLine(buffer.trim(), accumulated);
            }
            addEvent('success', `✓ 流式完成，共收到 ${eventCount} 个数据块`);
            setStatus('done');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            processLine(line.trim(), accumulated);
            eventCount++;

            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              accumulated += data;
              setResponse(accumulated);
            }
          }
        }
      } else {
        addEvent('error', 'Content-Type 不是 text/event-stream');
        const data = await response.json();
        setResponse(JSON.stringify(data, null, 2));
        setStatus('error');
      }
    } catch (error) {
      addEvent('error', `错误: ${error.message}`);
      setStatus('error');
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processLine = (line, accumulated) => {
    if (line.startsWith('event:')) {
      const eventName = line.slice(6).trim();
      addEvent('event', `Event: ${eventName}`);
    } else if (line.startsWith('data:')) {
      const data = line.slice(5).trim();
      if (data.length > 50) {
        addEvent('data', `Data (${data.length} chars): ${data.substring(0, 50)}...`);
      } else {
        addEvent('data', `Data: ${data}`);
      }
    } else if (line.startsWith(':')) {
      // Comment
      addEvent('comment', line);
    } else {
      addEvent('unknown', `Unknown line: ${line.substring(0, 50)}`);
    }
  };

  const addEvent = (type, message) => {
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const getTagColor = (type) => {
    const colors = {
      event: 'blue',
      data: 'green',
      info: 'cyan',
      success: 'green',
      error: 'red',
      comment: 'orange',
      unknown: 'gray',
    };
    return colors[type] || 'default';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 流式聊天诊断测试</Title>

      <Card style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>问题：</Text>
            <Input.TextArea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="输入你的问题..."
              disabled={loading}
            />
          </div>

          <div>
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleTest}
                loading={loading}
                size="large"
              >
                {loading ? '测试中...' : '开始测试'}
              </Button>
              <Tag color={status === 'streaming' ? 'blue' : status === 'done' ? 'green' : 'red'}>
                {status === 'streaming'
                  ? '正在流式传输'
                  : status === 'done'
                  ? '✓ 完成'
                  : status === 'error'
                  ? '✗ 错误'
                  : '待启动'}
              </Tag>
            </Space>
          </div>

          {status === 'error' && (
            <Alert message="流式请求出错，请查看下面的日志" type="error" showIcon />
          )}
        </Space>
      </Card>

      <Card title="📊 AI 响应 (原始数据)" style={{ marginBottom: '20px' }}>
        <div
          style={{
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {response || '（等待响应...）'}
        </div>
      </Card>

      <Card title={`📋 SSE 事件日志 (共 ${events.length} 条)`}>
        <div
          style={{
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {events.length === 0 ? (
            <Text type="secondary">（没有事件记录）</Text>
          ) : (
            <div>
              {events.map((evt) => (
                <div key={evt.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                  <Tag color={getTagColor(evt.type)} style={{ marginRight: '8px' }}>
                    {evt.type.toUpperCase()}
                  </Tag>
                  <Text type="secondary">{evt.timestamp}</Text>
                  <div style={{ marginTop: '4px', marginLeft: '16px', color: '#666' }}>
                    {evt.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Paragraph type="secondary" style={{ marginTop: '20px', fontSize: '12px' }}>
        💡
        提示：此诊断工具会显示流式接收的所有 SSE 事件。如果测试失败，请检查浏览器开发者工具（F12）的
        Network 标签，查看 /v1/ai/chat/stream 请求的详细信息。
      </Paragraph>
    </div>
  );
}
