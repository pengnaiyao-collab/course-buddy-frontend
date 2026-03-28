import React, { useState, useEffect } from 'react';
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

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const TAG_COLORS = [
  'blue','green','red','orange','purple','cyan','magenta','volcano','gold','lime',
];

const MOCK_TAGS = ['Algorithm', 'Data Structure', 'OOP', 'Database', 'Network', 'OS', 'Math', 'Security', 'AI', 'Web'];

const MOCK_LINKED_FILES = [
  { id: 1, name: 'Lecture_01_Introduction.pdf', type: 'pdf' },
  { id: 2, name: 'Week3_Algorithms.pptx', type: 'pptx' },
  { id: 3, name: 'Lab2_DataStructures.docx', type: 'docx' },
  { id: 4, name: 'Dataset_Training.xlsx', type: 'xlsx' },
];

const MOCK_POINTS = [
  {
    id: 1,
    title: 'Big-O Notation',
    content: 'Big-O notation describes the upper bound of the time complexity of an algorithm. It allows us to compare the efficiency of algorithms without worrying about hardware or implementation details. Common complexities include O(1), O(log n), O(n), O(n log n), O(n²), and O(2ⁿ).',
    tags: ['Algorithm', 'Math'],
    linkedFiles: [1, 2],
    createdAt: '2024-03-10',
    author: 'Prof. Chen',
  },
  {
    id: 2,
    title: 'Binary Search Tree (BST)',
    content: 'A BST is a binary tree in which each node has a key greater than all keys in its left subtree and less than all keys in its right subtree. Supports O(log n) average-time search, insertion, and deletion. Degenerates to O(n) in worst case (unbalanced tree).',
    tags: ['Data Structure', 'Algorithm'],
    linkedFiles: [2, 3],
    createdAt: '2024-03-11',
    author: 'Alice Wang',
  },
  {
    id: 3,
    title: 'ACID Properties',
    content: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. These are the four key properties that guarantee database transactions are processed reliably. Atomicity ensures all operations in a transaction succeed or all fail. Consistency ensures the database moves from one valid state to another.',
    tags: ['Database'],
    linkedFiles: [4],
    createdAt: '2024-03-12',
    author: 'Prof. Chen',
  },
  {
    id: 4,
    title: 'TCP/IP Model',
    content: 'The TCP/IP model is a concise framework that standardizes how networks communicate. It has four layers: Application, Transport, Internet, and Network Access. Unlike the OSI model (7 layers), TCP/IP focuses on practical implementation and forms the backbone of the modern internet.',
    tags: ['Network'],
    linkedFiles: [],
    createdAt: '2024-03-13',
    author: 'Bob Liu',
  },
  {
    id: 5,
    title: 'Process Scheduling',
    content: 'Process scheduling algorithms determine which process runs next on the CPU. Common algorithms include FCFS (First-Come-First-Served), SJF (Shortest Job First), Round Robin, and Priority Scheduling. Round Robin is widely used in time-sharing systems due to its fairness.',
    tags: ['OS'],
    linkedFiles: [1],
    createdAt: '2024-03-14',
    author: 'Carol Zhang',
  },
  {
    id: 6,
    title: 'SQL Joins',
    content: 'SQL JOIN clauses combine rows from two or more tables based on a related column. Types include INNER JOIN (matching rows only), LEFT JOIN (all left + matching right), RIGHT JOIN (all right + matching left), and FULL OUTER JOIN (all rows from both). Understanding joins is critical for efficient data retrieval.',
    tags: ['Database', 'Web'],
    linkedFiles: [4],
    createdAt: '2024-03-15',
    author: 'Prof. Chen',
  },
];

let idCounter = MOCK_POINTS.length + 1;

function KnowledgePointPage() {
  const [points, setPoints] = useState(MOCK_POINTS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setSelected(MOCK_POINTS[0]);
    }, 400);
  }, []);

  const filtered = points.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !p.tags.includes(filterTag)) return false;
    return true;
  });

  const allTags = [...new Set(points.flatMap((p) => p.tags))];

  const openCreate = () => {
    setEditingPoint(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (point) => {
    setEditingPoint(point);
    form.setFieldsValue({ ...point });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingPoint) {
        const updated = { ...editingPoint, ...values };
        setPoints((prev) => prev.map((p) => (p.id === editingPoint.id ? updated : p)));
        if (selected?.id === editingPoint.id) setSelected(updated);
        message.success('Knowledge point updated');
      } else {
        const newPoint = {
          ...values,
          id: idCounter++,
          createdAt: new Date().toISOString().slice(0, 10),
          author: 'Me',
          linkedFiles: [],
        };
        setPoints((prev) => [newPoint, ...prev]);
        setSelected(newPoint);
        message.success('Knowledge point created');
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
    message.success('Knowledge point deleted');
  };

  const getLinkedFiles = (ids) => MOCK_LINKED_FILES.filter((f) => ids.includes(f.id));

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
                {loading ? (
                  <div className="flex justify-center py-8"><Text type="secondary">Loading…</Text></div>
                ) : filtered.length === 0 ? (
                  <Empty description="No knowledge points found" />
                ) : (
                  filtered.map((point) => (
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

                  {selected.linkedFiles.length > 0 && (
                    <>
                      <Divider style={{ margin: '12px 0' }}>
                        <Space>
                          <LinkOutlined />
                          Associated Resources
                        </Space>
                      </Divider>
                      <List
                        size="small"
                        dataSource={getLinkedFiles(selected.linkedFiles)}
                        renderItem={(file) => (
                          <List.Item>
                            <Space>
                              <LinkOutlined style={{ color: '#1677ff' }} />
                              <Text>{file.name}</Text>
                              <Tag>{file.type.toUpperCase()}</Tag>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </>
                  )}
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
          onOk={handleSave}
          okText={editingPoint ? 'Save' : 'Create'}
          width={600}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
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
                options={MOCK_TAGS.map((t) => ({ label: t, value: t }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default KnowledgePointPage;
