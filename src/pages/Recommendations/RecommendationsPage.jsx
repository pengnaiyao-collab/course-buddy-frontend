import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Breadcrumb,
  Tabs,
  List,
  Avatar,
  Button,
  Space,
  Tag,
  Statistic,
  Carousel,
  Empty,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  BookOutlined,
  LikeOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;

const MOCK_RECOMMENDATIONS = {
  courses: [
    { id: 1, title: 'Advanced React Patterns', instructor: 'Alice', rating: 4.8, students: 1240, relevance: 95 },
    { id: 2, title: 'System Design for Interviews', instructor: 'Bob', rating: 4.9, students: 890, relevance: 92 },
    { id: 3, title: 'Kubernetes in Production', instructor: 'Carol', rating: 4.7, students: 650, relevance: 88 },
  ],
  knowledge: [
    { id: 1, title: 'React Hooks Deep Dive', category: 'Web Dev', relevance: 96 },
    { id: 2, title: 'Microservices Architecture', category: 'System Design', relevance: 91 },
    { id: 3, title: 'Database Optimization', category: 'Database', relevance: 85 },
  ],
  trending: [
    { id: 1, title: 'AI/ML Fundamentals', views: 5420, boost: 157 },
    { id: 2, title: 'Cloud Computing Basics', views: 4890, boost: 143 },
    { id: 3, title: 'Web Security Best Practices', views: 4120, boost: 118 },
  ],
  skillsToLearn: [
    { skill: 'TypeScript', proficiency: 0, relevance: 94 },
    { skill: 'System Design', proficiency: 0, relevance: 89 },
    { skill: 'Docker/Kubernetes', proficiency: 0, relevance: 85 },
  ],
};

function RecommendationsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // TODO: Call API for personalized recommendations
        setRecommendations(MOCK_RECOMMENDATIONS);
      } catch {
        setRecommendations(MOCK_RECOMMENDATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const CourseCard = ({ course }) => (
    <Card hoverable style={{ height: '100%' }}>
      <Card.Meta
        avatar={<Avatar icon={<BookOutlined />} size={48} style={{ background: '#1677ff' }} />}
        title={course.title}
        description={
          <div>
            <Text type="secondary">by {course.instructor}</Text>
            <br />
            <Space size="small" style={{ marginTop: 8 }}>
              <Tag color="orange">
                <StarFilled /> {course.rating}
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {course.students.toLocaleString()} students
              </Text>
            </Space>
          </div>
        }
      />
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">Match: {course.relevance}%</Text>
          <Button type="primary" size="small">Enroll</Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Recommendations' },
          ]}
        />

        <Title level={3} style={{ marginBottom: 24 }}>
          🎯 Personalized Recommendations
        </Title>

        <Tabs
          defaultActiveKey="courses"
          items={[
            {
              key: 'courses',
              label: '📚 Recommended Courses',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    {recommendations.courses.map((course) => (
                      <Col xs={24} sm={12} lg={8} key={course.id}>
                        <CourseCard course={course} />
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            },
            {
              key: 'knowledge',
              label: '🧠 Knowledge Items',
              children: (
                <List
                  dataSource={recommendations.knowledge}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" size="small">
                          Learn More
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<BookOutlined />} />}
                        title={item.title}
                        description={
                          <Space>
                            <Tag color="blue">{item.category}</Tag>
                            <Text type="secondary">Match: {item.relevance}%</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'trending',
              label: '🔥 Trending Now',
              children: (
                <List
                  dataSource={recommendations.trending}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<RiseOutlined />} style={{ background: '#ff7a45' }} />}
                        title={item.title}
                        description={
                          <Space>
                            <Text type="secondary">{item.views.toLocaleString()} views</Text>
                            <Tag color="red">+{item.boost} today</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'skills',
              label: '⚡ Skills to Learn',
              children: (
                <List
                  dataSource={recommendations.skillsToLearn}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="primary" size="small">
                          Start Learning
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size={48}
                            style={{ background: '#52c41a' }}
                            icon={<UserOutlined />}
                          />
                        }
                        title={item.skill}
                        description={
                          <Space>
                            <Text type="secondary">Current: Beginner</Text>
                            <Tag color="cyan">Relevance: {item.relevance}%</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}

export default RecommendationsPage;
