import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Select,
  Input,
  Popconfirm,
  message,
  Avatar,
  Tabs,
  Divider,
  Badge,
  Tooltip,
  Alert,
  Row,
  Col,
  Checkbox,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyOutlined,
  AuditOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  L1: { label: 'Course Admin', color: 'red', level: 1 },
  L2: { label: 'Core Collaborator', color: 'orange', level: 2 },
  L3: { label: 'Enrolled Member', color: 'blue', level: 3 },
  L4: { label: 'Campus Visitor', color: 'default', level: 4 },
};

const PERMISSION_MATRIX = [
  { permission: 'View Files', L1: true, L2: true, L3: true, L4: true },
  { permission: 'Download Files', L1: true, L2: true, L3: true, L4: false },
  { permission: 'Upload Files', L1: true, L2: true, L3: false, L4: false },
  { permission: 'Edit Knowledge Points', L1: true, L2: true, L3: false, L4: false },
  { permission: 'Delete Files', L1: true, L2: false, L3: false, L4: false },
  { permission: 'Export Materials', L1: true, L2: true, L3: true, L4: false },
  { permission: 'Manage Members', L1: true, L2: false, L3: false, L4: false },
  { permission: 'Review & Approve', L1: true, L2: true, L3: false, L4: false },
  { permission: 'View Audit Log', L1: true, L2: false, L3: false, L4: false },
];

const MOCK_MEMBERS = [
  { id: 1, name: 'Prof. Chen Wei', email: 'chen.wei@university.edu', role: 'L1', joinedAt: '2024-01-10', avatar: 'C' },
  { id: 2, name: 'Alice Wang', email: 'alice.wang@university.edu', role: 'L2', joinedAt: '2024-01-15', avatar: 'A' },
  { id: 3, name: 'Bob Liu', email: 'bob.liu@university.edu', role: 'L2', joinedAt: '2024-01-20', avatar: 'B' },
  { id: 4, name: 'Carol Zhang', email: 'carol.zhang@university.edu', role: 'L3', joinedAt: '2024-02-01', avatar: 'C' },
  { id: 5, name: 'David Kim', email: 'david.kim@university.edu', role: 'L3', joinedAt: '2024-02-05', avatar: 'D' },
  { id: 6, name: 'Emma Liu', email: 'emma.liu@student.edu', role: 'L3', joinedAt: '2024-02-10', avatar: 'E' },
  { id: 7, name: 'Frank Chen', email: 'frank.chen@student.edu', role: 'L4', joinedAt: '2024-02-15', avatar: 'F' },
  { id: 8, name: 'Grace Park', email: 'grace.park@student.edu', role: 'L4', joinedAt: '2024-02-20', avatar: 'G' },
];

const MOCK_AUDIT_LOG = [
  { id: 1, action: 'Upload File', user: 'Alice Wang', timestamp: '2024-03-15 10:23', details: 'Uploaded Lecture_01_Introduction.pdf' },
  { id: 2, action: 'Change Role', user: 'Prof. Chen Wei', timestamp: '2024-03-14 14:30', details: 'Changed Bob Liu from L3 to L2' },
  { id: 3, action: 'Delete File', user: 'Prof. Chen Wei', timestamp: '2024-03-14 11:00', details: 'Deleted old_notes_draft.docx' },
  { id: 4, action: 'Invite Member', user: 'Prof. Chen Wei', timestamp: '2024-03-13 09:15', details: 'Invited grace.park@student.edu as L4' },
  { id: 5, action: 'Edit Knowledge Point', user: 'Bob Liu', timestamp: '2024-03-12 16:45', details: 'Edited "Big-O Notation" knowledge point' },
  { id: 6, action: 'Rollback Version', user: 'Alice Wang', timestamp: '2024-03-12 10:20', details: 'Rolled back Week3_Algorithms.pptx to v2' },
  { id: 7, action: 'Remove Member', user: 'Prof. Chen Wei', timestamp: '2024-03-10 08:30', details: 'Removed temp_user@external.com' },
  { id: 8, action: 'Upload File', user: 'Bob Liu', timestamp: '2024-03-09 17:55', details: 'Uploaded CodeSamples_Week5.zip' },
];

const AVATAR_COLORS = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1677ff', '#52c41a', '#722ed1', '#eb2f96'];

let memberIdCounter = MOCK_MEMBERS.length + 1;

function PermissionManagePage() {
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
  }, []);

  const handleInvite = () => {
    form.validateFields().then((values) => {
      const namePart = values.email.split('@')[0];
      const newMember = {
        id: memberIdCounter++,
        name: namePart,
        email: values.email,
        role: values.role,
        joinedAt: new Date().toISOString().slice(0, 10),
        avatar: namePart[0].toUpperCase(),
      };
      setMembers((prev) => [...prev, newMember]);
      message.success(`Invitation sent to ${values.email}`);
      setInviteVisible(false);
      form.resetFields();
    });
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
    message.success('Role updated successfully');
  };

  const handleRemove = (memberId) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    message.success('Member removed');
  };

  const memberColumns = [
    {
      title: 'Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar
            style={{
              background: AVATAR_COLORS[record.id % AVATAR_COLORS.length],
              flexShrink: 0,
            }}
          >
            {record.avatar}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      render: (role, record) => (
        <Select
          value={role}
          onChange={(v) => handleRoleChange(record.id, v)}
          style={{ width: 170 }}
          options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({
            value: k,
            label: (
              <Space>
                <Tag color={v.color} style={{ margin: 0 }}>{k}</Tag>
                {v.label}
              </Space>
            ),
          }))}
        />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 110,
      render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        record.role !== 'L1' ? (
          <Popconfirm
            title={`Remove ${record.name}?`}
            description="This member will lose access to the knowledge base."
            onConfirm={() => handleRemove(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        ) : (
          <Tooltip title="Cannot remove the course admin">
            <Button size="small" disabled icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Tooltip>
        )
      ),
    },
  ];

  const auditColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    { title: 'User', dataIndex: 'user', key: 'user', width: 150 },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', width: 160,
      render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Details', dataIndex: 'details', key: 'details', ellipsis: true },
  ];

  const permissionColumns = [
    { title: 'Permission', dataIndex: 'permission', key: 'permission' },
    ...Object.entries(ROLE_CONFIG).map(([key, cfg]) => ({
      title: <Tag color={cfg.color}>{key} {cfg.label}</Tag>,
      dataIndex: key,
      key,
      width: 160,
      align: 'center',
      render: (v) => v
        ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        : <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />,
    })),
  ];

  const tabItems = [
    {
      key: 'members',
      label: (
        <Space>
          <TeamOutlined />
          Members
          <Badge count={members.length} style={{ backgroundColor: '#1677ff' }} />
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">{members.length} members in this knowledge base</Text>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setInviteVisible(true)}>
              Invite Member
            </Button>
          </div>
          <Table
            loading={loading}
            dataSource={members}
            columns={memberColumns}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            size="middle"
          />
        </div>
      ),
    },
    {
      key: 'matrix',
      label: (
        <Space>
          <SafetyOutlined />
          Permission Matrix
        </Space>
      ),
      children: (
        <div>
          <Alert
            message="Permission levels define what each role can do in the knowledge base."
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Table
            dataSource={PERMISSION_MATRIX}
            columns={permissionColumns}
            rowKey="permission"
            pagination={false}
            size="middle"
            bordered
          />
        </div>
      ),
    },
    {
      key: 'audit',
      label: (
        <Space>
          <AuditOutlined />
          Audit Log
        </Space>
      ),
      children: (
        <Table
          dataSource={MOCK_AUDIT_LOG}
          columns={auditColumns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          size="middle"
        />
      ),
    },
  ];

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} style={{ margin: 0 }}>Permission Management</Title>
        </div>

        {/* Role legend */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Row gutter={[16, 8]}>
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <Col key={key} xs={12} sm={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={cfg.color} style={{ fontSize: 13, padding: '4px 8px', margin: 0 }}>
                    {key}
                  </Tag>
                  <Text style={{ fontSize: 13 }}>{cfg.label}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>

        {/* Invite Modal */}
        <Modal
          title={
            <Space>
              <UserAddOutlined />
              Invite Member
            </Space>
          }
          open={inviteVisible}
          onCancel={() => { setInviteVisible(false); form.resetFields(); }}
          onOk={handleInvite}
          okText="Send Invitation"
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input placeholder="user@university.edu" />
            </Form.Item>
            <Form.Item
              name="role"
              label="Assign Role"
              initialValue="L3"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: (
                    <Space>
                      <Tag color={v.color}>{k}</Tag>
                      {v.label}
                    </Space>
                  ),
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default PermissionManagePage;
