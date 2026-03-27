import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Card,
  Avatar,
  Button,
  Input,
  List,
  Tag,
  Modal,
  Form,
  Breadcrumb,
  Space,
  Badge,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;

const SAMPLE_GROUPS = [
  { id: 1, name: 'CS101 Study Group', members: 8, topic: 'Introduction to CS', active: true },
  { id: 2, name: 'Algorithm Warriors', members: 5, topic: 'Data Structures', active: true },
  { id: 3, name: 'Web Dev Circle', members: 12, topic: 'Web Development', active: false },
  { id: 4, name: 'ML Enthusiasts', members: 6, topic: 'Machine Learning', active: true },
];

function CollaborationPage() {
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCreateGroup = (values) => {
    const newGroup = {
      id: groups.length + 1,
      name: values.name,
      topic: values.topic,
      members: 1,
      active: true,
    };
    setGroups((prev) => [newGroup, ...prev]);
    form.resetFields();
    setModalOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-blue-600 px-6">
        <div className="flex items-center gap-3">
          <TeamOutlined className="text-white text-xl" />
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
              { title: 'Collaboration' },
            ]}
          />

          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={3}>👥 Group Collaboration</Title>
              <Paragraph className="text-gray-500 mb-0">
                Join or create study groups to learn together.
              </Paragraph>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Create Group
            </Button>
          </div>

          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            dataSource={groups}
            renderItem={(group) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button key="join" type="link" icon={<MessageOutlined />}>
                      Join Chat
                    </Button>,
                  ]}
                >
                  <div className="flex items-start gap-3">
                    <Avatar size={48} icon={<TeamOutlined />} className="bg-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong className="truncate">
                          {group.name}
                        </Text>
                        <Badge
                          status={group.active ? 'success' : 'default'}
                          text={group.active ? 'Active' : 'Inactive'}
                        />
                      </div>
                      <Text className="text-gray-500 text-sm block mb-2">
                        {group.topic}
                      </Text>
                      <Space>
                        <UserOutlined className="text-gray-400" />
                        <Text className="text-gray-500 text-sm">
                          {group.members} members
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Content>
      </Layout>

      <Modal
        title="Create Study Group"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter a group name' }]}
          >
            <Input placeholder="e.g. CS101 Study Squad" />
          </Form.Item>
          <Form.Item
            name="topic"
            label="Topic / Course"
            rules={[{ required: true, message: 'Please enter a topic' }]}
          >
            <Input placeholder="e.g. Data Structures" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default CollaborationPage;
