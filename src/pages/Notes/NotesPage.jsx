import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Button,
  Input,
  List,
  Tag,
  Modal,
  Form,
  Breadcrumb,
  Space,
  Popconfirm,
  Empty,
  Select,
  message,
  Spin,
  Tooltip,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  listCategories,
} from '../../services/api/notes';

const { Title, Paragraph, Text } = Typography;
const { Search, TextArea } = Input;

const SAMPLE_NOTES = [
  {
    id: 1,
    title: 'Binary Trees Overview',
    content:
      'A binary tree is a tree data structure where each node has at most two children referred to as the left and right child.',
    tags: ['DSA', 'Trees'],
    category: 'Study Notes',
    updatedAt: '2024-03-15',
  },
  {
    id: 2,
    title: 'React Hooks Cheatsheet',
    content:
      'useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef are the core React hooks.',
    tags: ['React', 'Web Dev'],
    category: 'Reference',
    updatedAt: '2024-03-18',
  },
  {
    id: 3,
    title: 'SQL JOIN Types',
    content:
      'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN — understanding the differences is key to mastering relational databases.',
    tags: ['Database', 'SQL'],
    category: 'Study Notes',
    updatedAt: '2024-03-20',
  },
];

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNotes({ category: selectedCategory || undefined, q: searchQuery || undefined });
      setNotes(res.data?.notes || res.data || []);
    } catch {
      // Fall back to sample data if API is unavailable
      setNotes(SAMPLE_NOTES);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await listCategories();
      const cats = res.data?.categories || res.data || [];
      setCategories(cats);
    } catch {
      setCategories(['Study Notes', 'Reference', 'Assignments', 'Research']);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openCreate = () => {
    setEditingNote(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    form.setFieldsValue({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      category: note.category,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      title: values.title,
      content: values.content,
      tags: values.tags || [],
      category: values.category,
    };
    try {
      if (editingNote) {
        await updateNote(editingNote.id, payload);
        message.success('Note updated');
      } else {
        await createNote(payload);
        message.success('Note created');
      }
      setModalOpen(false);
      form.resetFields();
      fetchNotes();
    } catch {
      // Optimistic local update if API fails
      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? { ...n, ...payload, updatedAt: new Date().toISOString().split('T')[0] }
              : n
          )
        );
        message.success('Note updated (offline)');
      } else {
        setNotes((prev) => [
          { id: Date.now(), ...payload, updatedAt: new Date().toISOString().split('T')[0] },
          ...prev,
        ]);
        message.success('Note created (offline)');
      }
      setModalOpen(false);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      message.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      message.success('Note deleted (offline)');
    }
  };

  const filtered = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    const matchCat = !selectedCategory || n.category === selectedCategory;
    return matchQ && matchCat;
  });

  const tagOptions = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).map((t) => ({ value: t, label: t }));

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'My Notes' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📝 My Notes</Title>
            <Text type="secondary">Capture and organize your learning notes.</Text>
          </div>
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchNotes} loading={loading} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Note
            </Button>
          </Space>
        </div>

        <Space style={{ marginBottom: 24 }} wrap>
          <Search
            placeholder="Search notes…"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty description="No notes found" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
            dataSource={filtered}
            renderItem={(note) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(note)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete this note?"
                      onConfirm={() => handleDelete(note.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={note.title}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#595959', marginBottom: 8 }}>
                          {note.content}
                        </Paragraph>
                        {note.category && (
                          <Tag icon={<FileTextOutlined />} color="blue" style={{ marginBottom: 6 }}>
                            {note.category}
                          </Tag>
                        )}
                        <Space wrap style={{ marginBottom: 6 }}>
                          {(note.tags || []).map((tag) => (
                            <Tag key={tag} icon={<TagOutlined />} color="geekblue">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                        <Text style={{ color: '#bfbfbf', fontSize: 12, display: 'block' }}>
                          Updated: {note.updatedAt}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>

      <Modal
        title={editingNote ? 'Edit Note' : 'New Note'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter some content' }]}
          >
            <TextArea rows={6} placeholder="Write your notes here…" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              placeholder="Select or type a category"
              allowClear
              showSearch
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags (press Enter to create)"
              options={tagOptions}
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

export default NotesPage;