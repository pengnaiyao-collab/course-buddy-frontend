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
  FolderOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

const SAMPLE_CATEGORIES = [
  { id: 1, name: 'Study Notes', description: 'General study materials and notes', notesCount: 12, createdAt: '2024-01-15' },
  { id: 2, name: 'Reference', description: 'Reference documents and guides', notesCount: 5, createdAt: '2024-01-20' },
  { id: 3, name: 'Assignments', description: 'Assignment submissions and solutions', notesCount: 8, createdAt: '2024-02-01' },
  { id: 4, name: 'Research', description: 'Research papers and findings', notesCount: 3, createdAt: '2024-02-10' },
];

function NoteCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Call API to fetch categories
      // const res = await getCategoryList();
      // setCategories(res.data);
      setCategories(SAMPLE_CATEGORIES);
    } catch {
      setCategories(SAMPLE_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = {
      name: values.name,
      description: values.description,
    };

    try {
      if (editingCategory) {
        // TODO: Call API to update category
        // await updateCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...payload } : c
          )
        );
        message.success('Category updated successfully');
      } else {
        // TODO: Call API to create category
        // const res = await createCategory(payload);
        const newCategory = {
          id: Date.now(),
          ...payload,
          notesCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCategories((prev) => [newCategory, ...prev]);
        message.success('Category created successfully');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.success(
        editingCategory ? 'Category updated (offline)' : 'Category created (offline)'
      );
      setModalOpen(false);
      form.resetFields();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // TODO: Call API to delete category
      // await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      message.success('Category deleted successfully');
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      message.success('Category deleted (offline)');
    }
  };

  const columns = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FolderOutlined style={{ fontSize: 16 }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Notes Count',
      dataIndex: 'notesCount',
      key: 'notesCount',
      width: 120,
      render: (count) => (
        <Tag color="blue">{count} notes</Tag>
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
              title="Delete Category"
              description="Are you sure you want to delete this category? Notes in this category will not be deleted."
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
            { title: 'Categories' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              📁 Note Categories
            </Title>
            <Text type="secondary">Organize your notes with custom categories</Text>
          </div>
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              New Category
            </Button>
          </Space>
        </div>

        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : categories.length === 0 ? (
            <Empty description="No categories found" />
          ) : (
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} categories`,
              }}
            />
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingCategory ? 'Edit Category' : 'New Category'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={500}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="name"
              label="Category Name"
              rules={[
                { required: true, message: 'Please enter a category name' },
                { min: 2, message: 'Category name must be at least 2 characters' },
                { max: 50, message: 'Category name cannot exceed 50 characters' },
              ]}
            >
              <Input placeholder="e.g., Study Notes, Reference, Assignments" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 200, message: 'Description cannot exceed 200 characters' },
              ]}
            >
              <Input.TextArea
                placeholder="Optional: Describe the purpose of this category"
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default NoteCategoryPage;
