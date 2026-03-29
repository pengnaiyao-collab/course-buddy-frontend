import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Tabs,
  Table,
  Tag,
  Space,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Statistic,
  Row,
  Col,
  List,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

const MOCK_PROJECT = {
  id: 1,
  name: 'Web Development Platform',
  description: 'Building a comprehensive learning platform',
  status: 'active',
  owner: 'alice_wang',
  createdAt: '2024-01-15',
  memberCount: 5,
  taskCount: 12,
  completedTasks: 8,
};

const MOCK_MEMBERS = [
  { id: 1, name: 'Alice Wang', role: 'ADMIN', joinedAt: '2024-01-15' },
  { id: 2, name: 'Bob Liu', role: 'MEMBER', joinedAt: '2024-01-20' },
];

const MOCK_TASKS = [
  { id: 1, title: 'Design Database Schema', status: 'completed', assignee: 'alice_wang', dueDate: '2024-02-10', priority: 'high' },
  { id: 2, title: 'Implement API Endpoints', status: 'in_progress', assignee: 'bob_liu', dueDate: '2024-03-10', priority: 'high' },
];

function ProjectDetailPage() {
  const [project] = useState(MOCK_PROJECT);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [tasks] = useState(MOCK_TASKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const memberColumns = [
    { title: 'Member', dataIndex: 'name', key: 'name' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
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
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/collaboration', title: 'Collaboration' },
            { title: project.name },
          ]}
        />

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Title level={3} style={{ margin: '0 0 8px 0' }}>
                {project.name}
              </Title>
              <Text type="secondary">{project.description}</Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Tag color={project.status === 'active' ? 'green' : 'default'}>
                {project.status.toUpperCase()}
              </Tag>
            </Col>
          </Row>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Members" value={project.memberCount} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Total Tasks" value={project.taskCount} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Completed" value={project.completedTasks} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Progress" value={Math.round((project.completedTasks / project.taskCount) * 100)} suffix="%" /></Card>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="tasks"
          items={[
            {
              key: 'tasks',
              label: '📋 Tasks',
              children: (
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />}>
                      New Task
                    </Button>
                  </div>
                  <Table
                    columns={[
                      { title: 'Task', dataIndex: 'title', key: 'title' },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        render: (status) => (
                          <Tag color={status === 'completed' ? 'green' : 'blue'}>
                            {status}
                          </Tag>
                        ),
                      },
                      { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
                      { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
                      {
                        title: 'Priority',
                        dataIndex: 'priority',
                        render: (p) => <Tag color={p === 'high' ? 'red' : 'default'}>{p}</Tag>,
                      },
                    ]}
                    dataSource={tasks}
                    pagination={false}
                  />
                </Card>
              ),
            },
            {
              key: 'members',
              label: '👥 Members',
              children: (
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                      Invite Member
                    </Button>
                  </div>
                  <Table columns={memberColumns} dataSource={members} pagination={false} rowKey="id" />
                </Card>
              ),
            },
          ]}
        />

        <Modal
          title="Invite Member"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="member@example.com" />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select options={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'ADMIN', label: 'Admin' },
              ]} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default ProjectDetailPage;
