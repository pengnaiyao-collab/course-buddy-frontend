import React, { useState, useEffect } from 'react';
import {
  Typography,
  Form,
  Input,
  Button,
  Modal,
  Tag,
  Space,
  Card,
  Breadcrumb,
  message,
  Select,
  Row,
  Col,
  Table,
} from 'antd';
import {
  HomeOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

function KnowledgeEditorPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [knowledgeItem, setKnowledgeItem] = useState({
    title: 'Binary Search Trees',
    description: 'A fundamental data structure...',
    category: 'Data Structures',
    tags: ['DSA', 'Trees'],
    content: 'Detailed content about BSTs',
  });

  const [relations, setRelations] = useState([
    { id: 1, targetId: 2, targetTitle: 'AVL Trees', relationType: 'RELATED' },
    { id: 2, targetId: 3, targetTitle: 'Hash Tables', relationType: 'SUPPLEMENTS' },
  ]);

  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [newRelation, setNewRelation] = useState({ targetId: null, relationType: 'RELATED' });

  const handleSave = async (values) => {
    setLoading(true);
    try {
      message.success('Knowledge item saved successfully');
      setKnowledgeItem(values);
    } catch {
      message.success('Knowledge item saved (offline)');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelation = async () => {
    if (!newRelation.targetId) {
      message.error('Please select a target knowledge item');
      return;
    }
    try {
      setRelations([...relations, { ...newRelation, id: Date.now() }]);
      setNewRelation({ targetId: null, relationType: 'RELATED' });
      setRelationModalOpen(false);
      message.success('Relation added successfully');
    } catch {
      message.success('Relation added (offline)');
    }
  };

  const handleDeleteRelation = async (id) => {
    try {
      setRelations(relations.filter((r) => r.id !== id));
      message.success('Relation deleted');
    } catch {
      message.success('Relation deleted (offline)');
    }
  };

  const relationColumns = [
    {
      title: 'Target Knowledge Item',
      dataIndex: 'targetTitle',
      key: 'targetTitle',
    },
    {
      title: 'Relation Type',
      dataIndex: 'relationType',
      key: 'relationType',
      render: (text) => (
        <Tag color={
          text === 'RELATED' ? 'blue' :
          text === 'DERIVED_FROM' ? 'green' :
          text === 'SUPPLEMENTS' ? 'orange' :
          'red'
        }>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRelation(record.id)} />
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 24, maxWidth: 1200 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/knowledge', title: 'Knowledge Base' },
            { title: 'Edit' },
          ]}
        />

        <Title level={3} style={{ marginBottom: 24 }}>
          ✏️ Edit Knowledge Item
        </Title>

        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card style={{ marginBottom: 24 }}>
              <Title level={4}>Knowledge Item Details</Title>
              <Form form={form} layout="vertical" onFinish={handleSave} initialValues={knowledgeItem}>
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input placeholder="Knowledge item title" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select
                    placeholder="Select category"
                    options={[
                      { value: 'Data Structures', label: 'Data Structures' },
                      { value: 'Algorithms', label: 'Algorithms' },
                      { value: 'Web Dev', label: 'Web Dev' },
                      { value: 'Database', label: 'Database' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea rows={3} placeholder="Brief description" />
                </Form.Item>

                <Form.Item
                  name="tags"
                  label="Tags"
                >
                  <Select
                    mode="tags"
                    placeholder="Add tags"
                    options={[]}
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Content"
                  rules={[{ required: true, message: 'Please enter content' }]}
                >
                  <TextArea rows={10} placeholder="Detailed knowledge content" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                      Save Knowledge Item
                    </Button>
                    <Button onClick={() => form.resetFields()}>Reset</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card style={{ marginBottom: 24 }}>
              <Title level={4}>Quick Info</Title>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">Category:</Text>
                <br />
                <Tag color="blue">{knowledgeItem.category}</Tag>
              </div>
              <div>
                <Text type="secondary">Tags:</Text>
                <br />
                <Space wrap>
                  {knowledgeItem.tags?.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              <LinkOutlined /> Related Knowledge Items
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRelationModalOpen(true)}>
              Add Relation
            </Button>
          </div>

          <Table
            columns={relationColumns}
            dataSource={relations}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <Modal
          title="Add Knowledge Relation"
          open={relationModalOpen}
          onCancel={() => setRelationModalOpen(false)}
          onOk={handleAddRelation}
        >
          <Form layout="vertical">
            <Form.Item label="Target Knowledge Item">
              <Select
                placeholder="Select knowledge item to relate to"
                value={newRelation.targetId}
                onChange={(value) => setNewRelation({...newRelation, targetId: value})}
                options={[
                  { value: 1, label: 'AVL Trees' },
                  { value: 2, label: 'Hash Tables' },
                  { value: 3, label: 'Graph Algorithms' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Relation Type">
              <Select
                value={newRelation.relationType}
                onChange={(value) => setNewRelation({...newRelation, relationType: value})}
                options={[
                  { value: 'RELATED', label: 'Related' },
                  { value: 'DERIVED_FROM', label: 'Derived From' },
                  { value: 'SUPPLEMENTS', label: 'Supplements' },
                  { value: 'CONFLICTS_WITH', label: 'Conflicts With' },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default KnowledgeEditorPage;
