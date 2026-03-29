import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Modal,
  Table,
  Breadcrumb,
  Space,
  message,
  Spin,
  Empty,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

const SAMPLE_TAGS = [
  { id: 1, name: 'DSA', description: 'Data Structures & Algorithms', usage: 15, color: 'blue', createdAt: '2024-01-10' },
  { id: 2, name: 'React', description: 'React.js framework', usage: 8, color: 'cyan', createdAt: '2024-01-15' },
  { id: 3, name: 'Database', description: 'Database design and SQL', usage: 12, color: 'green', createdAt: '2024-01-20' },
  { id: 4, name: 'Web Dev', description: 'Web development', usage: 10, color: 'orange', createdAt: '2024-02-01' },
  { id: 5, name: 'Python', description: 'Python programming', usage: 7, color: 'purple', createdAt: '2024-02-05' },
  { id: 6, name: 'Interview', description: 'Interview preparation', usage: 5, color: 'red', createdAt: '2024-02-10' },
];

const COLORS = ['blue', 'cyan', 'green', 'orange', 'purple', 'red', 'volcano', 'gold', 'lime', 'magenta'];

function NoteTagPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Call API to fetch tags
      // const res = await getTagList();
      // setTags(res.data);
      setTags(SAMPLE_TAGS);
    } catch {
      setTags(SAMPLE_TAGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setSelectedColor('blue');
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (tag) => {
    setEditingTag(tag);
    setSelectedColor(tag.color || 'blue');
    form.setFieldsValue({
      name: tag.name,
      description: tag.description,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      name: values.name,
      description: values.description,
      color: selectedColor,
    };

    try {
      if (editingTag) {
        // TODO: Call API to update tag
        // await updateTag(editingTag.id, payload);
        setTags((prev) =>
          prev.map((t) =>
            t.id === editingTag.id ? { ...t, ...payload } : t
          )
        );
        message.success('Tag updated successfully');
      } else {
        // TODO: Call API to create tag
        // const res = await createTag(payload);
        const newTag = {
          id: Date.now(),
          ...payload,
          usage: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setTags((prev) => [newTag, ...prev]);
        message.success('Tag created successfully');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.success(
        editingTag ? 'Tag updated (offline)' : 'Tag created (offline)'
      );
      setModalOpen(false);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // TODO: Call API to delete tag
      // await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      message.success('Tag deleted successfully');
    } catch {
      setTags((prev) => prev.filter((t) => t.id !== id));
      message.success('Tag deleted (offline)');
    }
  };

  const columns = [
    {
      title: 'Tag',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color} icon={<TagsOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Usage',
      dataIndex: 'usage',
      key: 'usage',
      width: 100,
      render: (count) => (
        <Text strong>{count} notes</Text>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Tag"
              description="Are you sure you want to delete this tag? Notes will keep their content but this tag will be removed."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/notes', title: 'Notes' },
            { title: 'Tags' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              🏷️ Note Tags
            </Title>
            <Text type="secondary">Create and manage tags for organizing your notes</Text>
          </div>
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchTags} loading={loading} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              New Tag
            </Button>
          </Space>
        </div>

        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : tags.length === 0 ? (
            <Empty description="No tags found" />
          ) : (
            <Table
              columns={columns}
              dataSource={tags}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} tags`,
              }}
            />
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingTag ? 'Edit Tag' : 'New Tag'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="name"
              label="Tag Name"
              rules={[
                { required: true, message: 'Please enter a tag name' },
                { min: 1, message: 'Tag name must be at least 1 character' },
                { max: 30, message: 'Tag name cannot exceed 30 characters' },
              ]}
            >
              <Input placeholder="e.g., React, DSA, Interview" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 200, message: 'Description cannot exceed 200 characters' },
              ]}
            >
              <Input.TextArea
                placeholder="Optional: Describe what this tag represents"
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item label="Color">
              <Space wrap>
                {COLORS.map((color) => (
                  <Tag
                    key={color}
                    color={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      cursor: 'pointer',
                      border: selectedColor === color ? '2px solid #000' : '2px solid transparent',
                      borderRadius: 4,
                      padding: '4px 8px',
                    }}
                  >
                    {color}
                  </Tag>
                ))}
              </Space>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {editingTag ? 'Save Changes' : 'Create Tag'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default NoteTagPage;
