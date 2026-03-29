import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Breadcrumb,
  List,
  Avatar,
  Empty,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  CopyOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  FileTextOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MOCK_PROMPTS = [
  {
    id: 1,
    title: '复习大纲生成',
    category: 'review',
    template: '为以下内容生成详细的复习大纲：{content}',
    usage: 128,
    rating: 4.8,
    starred: true,
  },
  {
    id: 2,
    title: '考点梳理',
    category: 'examination',
    template: '提取这个主题的关键考点：{content}',
    usage: 95,
    rating: 4.6,
    starred: false,
  },
  {
    id: 3,
    title: '习题生成',
    category: 'practice',
    template: '基于以下内容生成5道相关习题：{content}',
    usage: 156,
    rating: 4.9,
    starred: true,
  },
];

function PromptLibraryPage() {
  const [prompts, setPrompts] = useState(MOCK_PROMPTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const handleAddPrompt = async (values) => {
    const newPrompt = {
      id: Math.max(...prompts.map(p => p.id), 0) + 1,
      ...values,
      usage: 0,
      rating: 5,
      starred: false,
    };
    setPrompts([newPrompt, ...prompts]);
    setModalOpen(false);
    form.resetFields();
  };

  const handleStarPrompt = (id) => {
    setPrompts(prompts.map(p =>
      p.id === id ? { ...p, starred: !p.starred } : p
    ));
  };

  const handleDeletePrompt = (id) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/ai', title: 'AI Content' },
            { title: 'Prompt Library' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              📚 Prompt Library
            </Title>
            <Text type="secondary">Curated prompts for content generation</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            New Prompt
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Prompts" value={prompts.length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Usages" value={prompts.reduce((sum, p) => sum + p.usage, 0)} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Avg Rating" value={(prompts.reduce((sum, p) => sum + p.rating, 0) / prompts.length).toFixed(1)} suffix="/5" />
            </Card>
          </Col>
        </Row>

        {prompts.length === 0 ? (
          <Empty description="No prompts found" />
        ) : (
          <List
            dataSource={prompts}
            renderItem={(prompt) => (
              <Card style={{ marginBottom: 16 }}>
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={
                      <div>
                        <Text strong style={{ fontSize: 16 }}>
                          {prompt.title}
                        </Text>
                        <Tag color="blue" style={{ marginLeft: 12 }}>
                          {prompt.category}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
                          {prompt.template}
                        </Text>
                        <Space style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Uses: {prompt.usage}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ⭐ {prompt.rating}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                  <Space>
                    <Button type="link" size="small" icon={<CopyOutlined />}>
                      Copy
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={prompt.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => handleStarPrompt(prompt.id)}
                    />
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePrompt(prompt.id)} />
                  </Space>
                </List.Item>
              </Card>
            )}
          />
        )}

        <Modal
          title="Create New Prompt"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleAddPrompt}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input placeholder="Prompt title" />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Input placeholder="e.g. review, examination, practice" />
            </Form.Item>
            <Form.Item name="template" label="Prompt Template" rules={[{ required: true }]}>
              <TextArea rows={5} placeholder="Use {content} as placeholder" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default PromptLibraryPage;
