import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Select,
  Divider,
  Empty,
  Popconfirm,
  message,
  List,
  Badge,
  Tooltip,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  LinkOutlined,
  BulbOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import {
  listKnowledgePoints,
  getKnowledgePoint,
  createKnowledgePoint,
  updateKnowledgePoint,
  deleteKnowledgePoint,
} from '../../services/api/knowledge';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const TAG_COLORS = [
  'blue','green','red','orange','purple','cyan','magenta','volcano','gold','lime',
];

const SAMPLE_POINTS = [
  {
    id: 1,
    title: 'Big-O Notation',
    content: 'Big-O notation describes the upper bound of the time complexity of an algorithm. It allows us to compare the efficiency of algorithms without worrying about hardware or implementation details.',
    tags: ['Algorithm', 'Math'],
    createdAt: '2024-03-10',
    author: 'Prof. Chen',
  },
  {
    id: 2,
    title: 'Binary Search Tree (BST)',
    content: 'A BST is a binary tree in which each node has a key greater than all keys in its left subtree and less than all keys in its right subtree.',
    tags: ['Data Structure', 'Algorithm'],
    createdAt: '2024-03-11',
    author: 'Alice Wang',
  },
];

function KnowledgePointPage() {
  const [points, setPoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listKnowledgePoints({ q: search || undefined });
      const data = res.data?.content || res.data || [];
      setPoints(data);
      if (data.length > 0 && !selected) {
        setSelected(data[0]);
      }
    } catch {
      setPoints(SAMPLE_POINTS);
      if (!selected && SAMPLE_POINTS.length > 0) {
        setSelected(SAMPLE_POINTS[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [search, selected]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const filtered = points.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !p.tags?.includes(filterTag)) return false;
    return true;
  });

  const allTags = [...new Set(points.flatMap((p) => p.tags || []))];

  const openCreate = () => {
    setEditingPoint(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (point) => {
    setEditingPoint(point);
    form.setFieldsValue({
      title: point.title,
      content: point.content,
      tags: point.tags || [],
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      title: values.title,
      content: values.content,
      tags: values.tags || [],
    };
    try {
      if (editingPoint) {
        await updateKnowledgePoint(editingPoint.id, payload);
        message.success('Knowledge point updated');
        setPoints((prev) =>
          prev.map((p) =>
            p.id === editingPoint.id
              ? { ...p, ...payload, updatedAt: new Date().toISOString().split('T')[0] }
              : p
          )
        );
      } else {
        await createKnowledgePoint(payload);
        message.success('Knowledge point created');
        setPoints((prev) => [{ id: Date.now(), ...payload, createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      // Optimistic local update if API fails
      if (editingPoint) {
        setPoints((prev) =>
          prev.map((p) =>
            p.id === editingPoint.id
              ? { ...p, ...payload, updatedAt: new Date().toISOString().split('T')[0] }
              : p
          )
        );
        message.success('Knowledge point updated (offline)');
      } else {
        setPoints((prev) => [{ id: Date.now(), ...payload, createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
        message.success('Knowledge point created (offline)');
      }
      setModalOpen(false);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteKnowledgePoint(id);
      message.success('Knowledge point deleted');
      setPoints((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      setPoints((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
      message.success('Knowledge point deleted (offline)');
    }
  };

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} style={{ margin: 0 }}>Knowledge Points</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Knowledge Point
          </Button>
        </div>

        <Row gutter={16} style={{ height: 'calc(100vh - 200px)' }}>
          {/* Left panel */}
          <Col xs={24} md={8} style={{ height: '100%' }}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 16 }}
            >
              <Search
                placeholder="Search knowledge points…"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Tag
                  style={{ cursor: 'pointer' }}
                  color={!filterTag ? 'blue' : 'default'}
                  onClick={() => setFilterTag(null)}
                >
                  All
                </Tag>
                {allTags.map((t) => (
                  <Tag
                    key={t}
                    style={{ cursor: 'pointer' }}
                    color={filterTag === t ? 'blue' : 'default'}
                    onClick={() => setFilterTag(filterTag === t ? null : t)}
                    icon={<TagOutlined />}
                  >
                    {t}
                  </Tag>
                ))}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <Spin spinning={loading} />
                {!loading && filtered.length === 0 ? (
                  <Empty description="No knowledge points found" />
                ) : (
                  !loading && filtered.map((point) => (
                    <div
                      key={point.id}
                      onClick={() => setSelected(point)}
                      style={{
                        padding: '10px 12px',
                        marginBottom: 8,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selected?.id === point.id ? '#e6f4ff' : '#fafafa',
                        border: selected?.id === point.id ? '1px solid #91caff' : '1px solid #f0f0f0',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <Text strong style={{ fontSize: 14 }} ellipsis>
                          {point.title}
                        </Text>
                        <Space size={2}>
                          <Tooltip title="Edit">
                            <Button
                              size="small"
                              type="text"
                              icon={<EditOutlined />}
                              onClick={(e) => { e.stopPropagation(); openEdit(point); }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Delete this knowledge point?"
                            onConfirm={(e) => { e?.stopPropagation(); handleDelete(point.id); }}
                          >
                            <Button
                              size="small"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {point.tags.map((t, i) => (
                          <Tag key={t} color={TAG_COLORS[i % TAG_COLORS.length]} style={{ fontSize: 11 }}>
                            {t}
                          </Tag>
                        ))}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {point.author} · {point.createdAt}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Col>

          {/* Right panel */}
          <Col xs={24} md={16} style={{ height: '100%' }}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowY: 'auto' }}
            >
              {selected ? (
                <div style={{ padding: 8 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{selected.title}</Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Created by {selected.author} · {selected.createdAt}
                      </Text>
                    </div>
                    <Button icon={<EditOutlined />} onClick={() => openEdit(selected)}>
                      Edit
                    </Button>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    {selected.tags.map((t, i) => (
                      <Tag key={t} color={TAG_COLORS[i % TAG_COLORS.length]}>
                        <TagOutlined /> {t}
                      </Tag>
                    ))}
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#374151' }}>
                    {selected.content}
                  </Paragraph>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <BulbOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Text type="secondary" style={{ marginTop: 16 }}>
                    Select a knowledge point to view details
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Create/Edit Modal */}
        <Modal
          title={editingPoint ? 'Edit Knowledge Point' : 'New Knowledge Point'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingPoint ? 'Save' : 'Create'}
          width={600}
          confirmLoading={saving}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
            onFinish={handleSave}
          >
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="Enter knowledge point title" />
            </Form.Item>
            <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Content is required' }]}>
              <TextArea rows={6} placeholder="Describe the knowledge point in detail…" />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                placeholder="Add tags (press Enter to create)"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default KnowledgePointPage;
