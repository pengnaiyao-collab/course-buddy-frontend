import React, { useState } from 'react';
import {
  Layout,
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
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search, TextArea } = Input;

const SAMPLE_NOTES = [
  {
    id: 1,
    title: 'Binary Trees Overview',
    content:
      'A binary tree is a tree data structure where each node has at most two children referred to as the left and right child.',
    tags: ['DSA', 'Trees'],
    updatedAt: '2024-03-15',
  },
  {
    id: 2,
    title: 'React Hooks Cheatsheet',
    content:
      'useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef are the core React hooks.',
    tags: ['React', 'Web Dev'],
    updatedAt: '2024-03-18',
  },
  {
    id: 3,
    title: 'SQL JOIN Types',
    content:
      'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN — understanding the differences is key to mastering relational databases.',
    tags: ['Database', 'SQL'],
    updatedAt: '2024-03-20',
  },
];

function NotesPage() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
      tags: note.tags.join(', '),
    });
    setModalOpen(true);
  };

  const handleSave = (values) => {
    const tagList = values.tags
      ? values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: values.title,
                content: values.content,
                tags: tagList,
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : n
        )
      );
    } else {
      const newNote = {
        id: Date.now(),
        title: values.title,
        content: values.content,
        tags: tagList,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-blue-600 px-6">
        <div className="flex items-center gap-3">
          <FileTextOutlined className="text-white text-xl" />
          <Title level={4} className="!text-white !mb-0">
            Course Buddy
          </Title>
        </div>
        <Button type="text" className="!text-white" onClick={handleLogout}>
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider width={220} className="bg-white shadow-sm">
          <nav className="py-4">
            {[
              { path: '/courses', label: 'Course Library', icon: '📚' },
              { path: '/qa', label: 'Q&A Assistant', icon: '🤖' },
              { path: '/collaboration', label: 'Collaboration', icon: '👥' },
              { path: '/notes', label: 'My Notes', icon: '📝' },
            ].map((item) => (
              <div
                key={item.path}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                  window.location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600'
                    : 'text-gray-700'
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </Sider>

        <Content className="p-6 bg-gray-50">
          <Breadcrumb
            className="mb-4"
            items={[
              { href: '/', title: <HomeOutlined /> },
              { title: 'My Notes' },
            ]}
          />

          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={3}>📝 My Notes</Title>
              <Paragraph className="text-gray-500 mb-0">
                Capture and organize your learning notes.
              </Paragraph>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Note
            </Button>
          </div>

          <Search
            placeholder="Search notes…"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-6"
            style={{ width: 320 }}
            allowClear
          />

          {filtered.length === 0 ? (
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
                          <Paragraph
                            ellipsis={{ rows: 3 }}
                            className="text-gray-600 mb-3"
                          >
                            {note.content}
                          </Paragraph>
                          <Space wrap className="mb-2">
                            {note.tags.map((tag) => (
                              <Tag key={tag} color="geekblue">
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                          <Text className="text-gray-400 text-xs block">
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
        </Content>
      </Layout>

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
          <Form.Item name="tags" label="Tags (comma-separated)">
            <Input placeholder="e.g. DSA, Trees, Algorithms" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default NotesPage;