import React, { useState, useEffect, useCallback } from 'react';
import {
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
  Progress,
  Modal,
  Tabs,
  List,
  Avatar,
  Divider,
  message,
  Tooltip,
} from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  PlusOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';
import {
  listCourses,
  enrollCourse,
  unenrollCourse,
  listDiscussions,
  createDiscussion,
} from '../../services/api/courses';

const { Title, Paragraph, Text } = Typography;
const { Search, TextArea } = Input;

const SAMPLE_COURSES = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'Fundamentals of programming, algorithms, and data structures.',
    tags: ['CS', 'Beginner'],
    materials: 24,
    enrolled: false,
    progress: 0,
    instructor: 'Prof. Chen',
    studentCount: 128,
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms',
    description: 'Deep dive into lists, trees, graphs, sorting, and searching.',
    tags: ['CS', 'Intermediate'],
    materials: 36,
    enrolled: true,
    progress: 65,
    instructor: 'Alice Wang',
    studentCount: 94,
  },
  {
    id: 3,
    title: 'Web Development Fundamentals',
    description: 'HTML, CSS, JavaScript and the modern web ecosystem.',
    tags: ['Web', 'Beginner'],
    materials: 30,
    enrolled: true,
    progress: 40,
    instructor: 'Bob Liu',
    studentCount: 156,
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    description: 'Introduction to supervised and unsupervised learning with Python.',
    tags: ['ML', 'Intermediate'],
    materials: 28,
    enrolled: false,
    progress: 0,
    instructor: 'Prof. Chen',
    studentCount: 72,
  },
  {
    id: 5,
    title: 'Database Systems',
    description: 'Relational databases, SQL, NoSQL, and query optimization.',
    tags: ['DB', 'Intermediate'],
    materials: 20,
    enrolled: false,
    progress: 0,
    instructor: 'Carol Zhang',
    studentCount: 88,
  },
  {
    id: 6,
    title: 'Software Engineering',
    description: 'Agile methodology, design patterns, and software architecture.',
    tags: ['SE', 'Advanced'],
    materials: 32,
    enrolled: false,
    progress: 0,
    instructor: 'David Kim',
    studentCount: 61,
  },
];

function CourseLibraryPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [discussionInput, setDiscussionInput] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCourses({ q: searchQuery || undefined });
      setCourses(res.data?.courses || res.data || []);
    } catch {
      setCourses(SAMPLE_COURSES);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (course) => {
    setEnrollingId(course.id);
    try {
      if (course.enrolled) {
        await unenrollCourse(course.id);
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, enrolled: false, progress: 0 } : c))
        );
        message.success(`Unenrolled from "${course.title}"`);
      } else {
        await enrollCourse(course.id);
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, enrolled: true } : c))
        );
        message.success(`Enrolled in "${course.title}"!`);
      }
    } catch {
      // Optimistic local update
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, enrolled: !c.enrolled, progress: c.enrolled ? 0 : c.progress } : c
        )
      );
      message.success(course.enrolled ? 'Unenrolled (offline)' : 'Enrolled (offline)');
    } finally {
      setEnrollingId(null);
    }
  };

  const openDetail = async (course) => {
    setSelectedCourse(course);
    setDetailVisible(true);
    setDiscussions([]);
    try {
      const res = await listDiscussions(course.id);
      setDiscussions(res.data?.discussions || res.data || []);
    } catch {
      setDiscussions([
        { id: 1, author: 'Alice Wang', content: 'Great course! The algorithm sections are very clear.', createdAt: '2024-03-15' },
        { id: 2, author: 'Bob Liu', content: 'Could use more practice problems.', createdAt: '2024-03-16' },
      ]);
    }
  };

  const handlePostDiscussion = async () => {
    if (!discussionInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      author: user?.username || 'Me',
      content: discussionInput.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      await createDiscussion(selectedCourse.id, { content: discussionInput.trim() });
    } catch {
      // Proceed with local update
    }
    setDiscussions((prev) => [...prev, newMsg]);
    setDiscussionInput('');
  };

  const filtered = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Course Library' },
          ]}
        />

        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📚 Course Library</Title>
            <Text type="secondary">Browse and explore course materials, lecture notes, and resources.</Text>
          </div>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={fetchCourses} loading={loading} />
          </Tooltip>
        </div>

        <Space style={{ marginBottom: 24 }}>
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
          <div style={{ textAlign: 'center', padding: 60 }}>
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
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      key="detail"
                      type="link"
                      icon={<MessageOutlined />}
                      onClick={() => openDetail(course)}
                    >
                      Details
                    </Button>,
                    <Button
                      key="enroll"
                      type="link"
                      icon={course.enrolled ? <CheckCircleOutlined /> : <PlusOutlined />}
                      style={{ color: course.enrolled ? '#52c41a' : undefined }}
                      loading={enrollingId === course.id}
                      onClick={() => handleEnroll(course)}
                    >
                      {course.enrolled ? 'Enrolled' : 'Enroll'}
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={course.title}
                    description={
                      <div>
                        <Paragraph style={{ color: '#595959', marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                          {course.description}
                        </Paragraph>
                        <Space wrap style={{ marginBottom: 8 }}>
                          {(course.tags || []).map((tag) => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </Space>
                        {course.enrolled && (
                          <div style={{ marginTop: 8 }}>
                            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Progress: {course.progress || 0}%</Text>
                            <Progress percent={course.progress || 0} size="small" style={{ marginTop: 4 }} />
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                            <UserOutlined /> {course.instructor || 'Unknown'}  ·  {course.materials || 0} materials  ·  {course.studentCount || 0} students
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Course Detail Modal */}
      <Modal
        title={selectedCourse?.title}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={680}
      >
        {selectedCourse && (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: 'Overview',
                children: (
                  <div>
                    <Paragraph>{selectedCourse.description}</Paragraph>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={8}><Text strong>Instructor:</Text> <Text>{selectedCourse.instructor}</Text></Col>
                      <Col span={8}><Text strong>Materials:</Text> <Text>{selectedCourse.materials}</Text></Col>
                      <Col span={8}><Text strong>Students:</Text> <Text>{selectedCourse.studentCount}</Text></Col>
                    </Row>
                    {selectedCourse.enrolled && (
                      <>
                        <Divider />
                        <Text strong>Your Progress</Text>
                        <Progress percent={selectedCourse.progress || 0} style={{ marginTop: 8 }} />
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: 'discussions',
                label: 'Discussions',
                children: (
                  <div>
                    <List
                      dataSource={discussions}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<><Text strong>{item.author}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{item.createdAt}</Text></>}
                            description={item.content}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: 'No discussions yet' }}
                    />
                    <Divider />
                    <Space.Compact style={{ width: '100%' }}>
                      <TextArea
                        value={discussionInput}
                        onChange={(e) => setDiscussionInput(e.target.value)}
                        placeholder="Write a comment…"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                      <Button type="primary" onClick={handlePostDiscussion} disabled={!discussionInput.trim()}>
                        Post
                      </Button>
                    </Space.Compact>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </AppLayout>
  );
}

export default CourseLibraryPage;
