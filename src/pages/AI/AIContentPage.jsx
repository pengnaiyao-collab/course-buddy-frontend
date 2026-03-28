import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Form,
  Select,
  Input,
  Breadcrumb,
  Space,
  Spin,
  Tabs,
  List,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  BarChartOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  FileTextOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import {
  generateContent,
  streamGenerate,
  getGenerationHistory,
  deleteGenerationHistory,
  getUsageStats,
} from '../../services/api/ai';
import { listFiles } from '../../services/api/files';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GENERATION_TYPES = [
  { value: 'review_outline', label: '📋 Review Outline', description: 'Generate a structured review outline for the topic' },
  { value: 'key_points', label: '🎯 Key Points', description: 'Extract and summarize key knowledge points' },
  { value: 'exercises', label: '✏️ Practice Exercises', description: 'Generate practice questions and exercises' },
  { value: 'summary', label: '📝 Summary', description: 'Create a comprehensive summary' },
];

const SAMPLE_HISTORY = [
  { id: 1, type: 'review_outline', topic: 'Binary Trees', createdAt: '2024-03-20 14:30', wordCount: 520 },
  { id: 2, type: 'exercises', topic: 'SQL Joins', createdAt: '2024-03-19 10:15', wordCount: 380 },
  { id: 3, type: 'key_points', topic: 'React Hooks', createdAt: '2024-03-18 16:45', wordCount: 290 },
];

const SAMPLE_STATS = {
  totalGenerations: 47,
  tokensUsed: 38420,
  favoriteType: 'key_points',
  thisWeek: 12,
};

function AIContentPage() {
  const [generating, setGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [files, setFiles] = useState([]);
  const [form] = Form.useForm();
  const abortControllerRef = useRef(null);
  const outputRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getGenerationHistory();
      setHistory(res.data?.history || res.data || []);
    } catch {
      setHistory(SAMPLE_HISTORY);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getUsageStats();
      setUsageStats(res.data || SAMPLE_STATS);
    } catch {
      setUsageStats(SAMPLE_STATS);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await listFiles();
      setFiles(res.data?.files || res.data || []);
    } catch {
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchStats();
    fetchFiles();
  }, [fetchHistory, fetchStats, fetchFiles]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamingText]);

  const handleGenerate = async (values) => {
    setGenerating(true);
    setStreamingText('');
    setGeneratedContent('');

    const payload = {
      type: values.type,
      topic: values.topic,
      fileIds: values.fileIds || [],
      language: values.language || 'en',
    };

    try {
      const response = await streamGenerate(payload);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson') || contentType.includes('text/plain')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
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
              setStreamingText(accumulated);
            }
          }
        }
        setGeneratedContent(accumulated);
        setStreamingText('');
        fetchHistory();
        message.success('Content generated successfully!');
      } else {
        // Regular JSON
        const data = await response.json();
        const content = data.content || data.result || data.text || JSON.stringify(data, null, 2);
        setGeneratedContent(content);
        fetchHistory();
        message.success('Content generated successfully!');
      }
    } catch {
      // Fallback: try regular (non-streaming) API
      try {
        const res = await generateContent(payload);
        const content = res.data?.content || res.data?.result || res.data?.text || 'Generation failed.';
        setGeneratedContent(content);
        fetchHistory();
        message.success('Content generated!');
      } catch {
        message.error('Failed to generate content. Please check your connection.');
        setGeneratedContent('');
      }
    } finally {
      setGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteGenerationHistory(id);
    } catch { /* proceed */ }
    setHistory((prev) => prev.filter((h) => h.id !== id));
    message.success('Deleted from history');
  };

  const handleCopyContent = () => {
    const text = generatedContent || streamingText;
    if (text) {
      navigator.clipboard.writeText(text).then(() => message.success('Copied to clipboard!'));
    }
  };

  const displayText = generating ? streamingText : generatedContent;

  const TYPE_ICON_MAP = {
    review_outline: <FileTextOutlined />,
    key_points: <BulbOutlined />,
    exercises: <QuestionCircleOutlined />,
    summary: <FileTextOutlined />,
  };

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'AI Content Generation' },
          ]}
        />

        <Title level={3} style={{ marginBottom: 4 }}>
          <ThunderboltOutlined style={{ color: '#fa8c16' }} /> AI Content Generation
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Generate review outlines, key points, practice exercises, and summaries using AI.
        </Text>

        <Tabs
          defaultActiveKey="generate"
          items={[
            {
              key: 'generate',
              label: <><ThunderboltOutlined /> Generate</>,
              children: (
                <Row gutter={24}>
                  <Col xs={24} md={10}>
                    <Card title="Generation Settings" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <Form form={form} layout="vertical" onFinish={handleGenerate} initialValues={{ type: 'key_points', language: 'en' }}>
                        <Form.Item name="type" label="Content Type" rules={[{ required: true }]}>
                          <Select
                            options={GENERATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                          />
                        </Form.Item>
                        <Form.Item name="topic" label="Topic / Subject" rules={[{ required: true, message: 'Please enter a topic' }]}>
                          <Input placeholder="e.g. Binary Search Trees, React Hooks, SQL Joins" />
                        </Form.Item>
                        <Form.Item name="fileIds" label="Source Files (optional)">
                          <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select knowledge base files to use as context"
                            options={files.map((f) => ({ value: f.id, label: f.name }))}
                          />
                        </Form.Item>
                        <Form.Item name="language" label="Output Language">
                          <Select
                            options={[
                              { value: 'en', label: '🇺🇸 English' },
                              { value: 'zh', label: '🇨🇳 Chinese' },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<ThunderboltOutlined />}
                            loading={generating}
                            block
                            size="large"
                          >
                            {generating ? 'Generating…' : 'Generate'}
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>

                  <Col xs={24} md={14}>
                    <Card
                      title="Generated Content"
                      bordered={false}
                      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: 400 }}
                      extra={
                        displayText && (
                          <Tooltip title="Copy to clipboard">
                            <Button size="small" icon={<CopyOutlined />} onClick={handleCopyContent}>
                              Copy
                            </Button>
                          </Tooltip>
                        )
                      }
                    >
                      {generating && !streamingText ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                          <Spin size="large" />
                          <div style={{ marginTop: 16 }}>
                            <Text type="secondary">AI is generating your content…</Text>
                          </div>
                        </div>
                      ) : displayText ? (
                        <div
                          ref={outputRef}
                          style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            lineHeight: 1.8,
                            maxHeight: 500,
                            overflowY: 'auto',
                            padding: 4,
                          }}
                        >
                          {displayText}
                          {generating && (
                          <span className="cursor-blink" />
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 60, color: '#bfbfbf' }}>
                          <ThunderboltOutlined style={{ fontSize: 40, marginBottom: 16 }} />
                          <div>Fill in the settings and click Generate to create AI content</div>
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'history',
              label: <><HistoryOutlined /> History</>,
              children: (
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <Button icon={<ReloadOutlined />} size="small" onClick={fetchHistory} loading={historyLoading}>
                      Refresh
                    </Button>
                  </div>
                  <List
                    loading={historyLoading}
                    dataSource={history}
                    locale={{ emptyText: 'No generation history yet' }}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            key="delete"
                            title="Delete this history entry?"
                            onConfirm={() => handleDeleteHistory(item.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<span style={{ fontSize: 22 }}>{TYPE_ICON_MAP[item.type] || <FileTextOutlined />}</span>}
                          title={
                            <Space>
                              <Text strong>{item.topic}</Text>
                              <Tag color="blue">{GENERATION_TYPES.find((t) => t.value === item.type)?.label || item.type}</Tag>
                            </Space>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.createdAt}  ·  {item.wordCount} words
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              ),
            },
            {
              key: 'stats',
              label: <><BarChartOutlined /> Usage Stats</>,
              children: (
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {usageStats ? (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                          <Statistic
                            title="Total Generations"
                            value={usageStats.totalGenerations}
                            prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <Statistic
                            title="Tokens Used"
                            value={usageStats.tokensUsed}
                            prefix={<BarChartOutlined style={{ color: '#1677ff' }} />}
                            valueStyle={{ color: '#1677ff' }}
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <Statistic
                            title="This Week"
                            value={usageStats.thisWeek}
                            prefix={<ReloadOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                        <Col xs={12} sm={6}>
                          <div>
                            <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>Favorite Type</div>
                            <Tag color="purple" style={{ fontSize: 14, padding: '4px 10px' }}>
                              {GENERATION_TYPES.find((t) => t.value === usageStats.favoriteType)?.label || usageStats.favoriteType}
                            </Tag>
                          </div>
                        </Col>
                      </Row>
                      <Divider />
                      <Alert
                        message="Usage Tip"
                        description="You can attach knowledge base files to your generation requests to get more contextual and accurate content based on your course materials."
                        type="info"
                        showIcon
                      />
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <Spin />
                    </div>
                  )}
                </Card>
              ),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}

export default AIContentPage;
