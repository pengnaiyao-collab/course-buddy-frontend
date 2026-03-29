import React, { useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Breadcrumb,
  Modal,
  Form,
  Select,
} from 'antd';
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title } = Typography;

const MOCK_PERMISSIONS = [
  { id: 1, resource: 'Notes', user: 'alice_wang', permission: 'READ_WRITE', assignedAt: '2024-03-15' },
  { id: 2, resource: 'Knowledge Items', user: 'bob_liu', permission: 'READ_ONLY', assignedAt: '2024-03-20' },
  { id: 3, resource: 'Courses', user: 'carol_zhang', permission: 'ADMIN', assignedAt: '2024-03-10' },
];

function PermissionsPage() {
  const [permissions, setPermissions] = useState(MOCK_PERMISSIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'Resource', dataIndex: 'resource', key: 'resource' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    {
      title: 'Permission',
      dataIndex: 'permission',
      render: (p) => (
        <Tag color={p === 'ADMIN' ? 'red' : p === 'READ_WRITE' ? 'blue' : 'green'}>
          {p}
        </Tag>
      ),
    },
    { title: 'Assigned At', dataIndex: 'assignedAt', key: 'assignedAt' },
    {
      title: 'Actions',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Permissions' }]} />
        <Title level={3} style={{ marginBottom: 24 }}>
          🔐 Permissions Management
        </Title>
        <Card>
          <Table columns={columns} dataSource={permissions} pagination={false} />
        </Card>
      </div>
    </AppLayout>
  );
}

export default PermissionsPage;
