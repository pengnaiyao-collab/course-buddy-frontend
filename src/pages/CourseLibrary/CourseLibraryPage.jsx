import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Input,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Breadcrumb,
  Space,
  Spin,
  Empty,
} from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const SAMPLE_COURSES = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'Fundamentals of programming, algorithms, and data structures.',
    tags: ['CS', 'Beginner'],
    materials: 24,
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms',
    description: 'Deep dive into lists, trees, graphs, sorting, and searching.',
    tags: ['CS', 'Intermediate'],
    materials: 36,
  },
  {
    id: 3,
    title: 'Web Development Fundamentals',
    description: 'HTML, CSS, JavaScript and the modern web ecosystem.',
    tags: ['Web', 'Beginner'],
    materials: 30,
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    description: 'Introduction to supervised and unsupervised learning with Python.',
    tags: ['ML', 'Intermediate'],
    materials: 28,
  },
  {
    id: 5,
    title: 'Database Systems',
    description: 'Relational databases, SQL, NoSQL, and query optimization.',
    tags: ['DB', 'Intermediate'],
    materials: 20,
  },
  {
    id: 6,
    title: 'Software Engineering',
    description: 'Agile methodology, design patterns, and software architecture.',
    tags: ['SE', 'Advanced'],
    materials: 32,
  },
];

function CourseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filtered = SAMPLE_COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-blue-600 px-6">
        <div className="flex items-center gap-3">
          <BookOutlined className="text-white text-xl" />
          <Title level={4} className="!text-white !mb-0">
            Course Buddy
          </Title>
        </div>
        <Button
          icon={<LogoutOutlined />}
          type="text"
          className="!text-white"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider width={220} className="bg-white shadow-sm">
          <div className="py-4">
            <nav>
              {[
                { path: '/courses', label: 'Course Library', icon: '📚' },
                { path: '/qa', label: 'Q&A Assistant', icon: '🤖' },
                { path: '/collaboration', label: 'Collaboration', icon: '👥' },
                { path: '/notes', label: 'My Notes', icon: '📝' },
              ].map((item) => (
                <div
                  key={item.path}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    window.location.pathname === item.path ? 'bg-blue-50 text-blue-600 font-medium border-r-2 border-blue-600' : 'text-gray-700'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </nav>
          </div>
        </Sider>

        <Content className="p-6 bg-gray-50">
          <Breadcrumb
            className="mb-4"
            items={[
              { href: '/', title: <HomeOutlined /> },
              { title: 'Course Library' },
            ]}
          />

          <div className="mb-6">
            <Title level={3}>📚 Course Library</Title>
            <Paragraph className="text-gray-500">
              Browse and explore course materials, lecture notes, and resources.
            </Paragraph>
          </div>

          <Space className="mb-6" size="large">
            <Search
              placeholder="Search courses…"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />
          </Space>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" />
            </div>
          ) : filtered.length === 0 ? (
            <Empty description="No courses found" />
          ) : (
            <Row gutter={[16, 16]}>
              {filtered.map((course) => (
                <Col key={course.id} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="h-full"
                    actions={[
                      <Button key="view" type="link">
                        View Materials ({course.materials})
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={course.title}
                      description={
                        <div>
                          <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 2 }}>
                            {course.description}
                          </Paragraph>
                          <Space wrap>
                            {course.tags.map((tag) => (
                              <Tag key={tag} color="blue">
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default CourseLibraryPage;
