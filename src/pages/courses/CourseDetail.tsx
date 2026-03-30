import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tabs, Spin, Tag, message } from 'antd';
import { ArrowLeftOutlined, ReadOutlined, TeamOutlined, FolderOpenOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res: any = await request.get(`/api/v1/courses-catalog/${id}`);
      setCourse(res.data || res);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await request.post('/api/enrollments', { courseId: Number(id) });
      message.success('成功加入课程');
      fetchCourseDetail(); // 刷新数据
    } catch (error) {
      // 错误已在拦截器中处理
    }
  };

  if (loading || !course) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }} />;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回列表
        </Button>
      </div>

      <Card
        title={<h2>{course.name}</h2>}
        extra={<Button type="primary" onClick={handleEnroll}>加入课程</Button>}
        style={{ marginBottom: 24 }}
      >
        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="课程代码">{course.code || '-'}</Descriptions.Item>
          <Descriptions.Item label="难度等级">
            <Tag color="blue">{course.level || 'BEGINNER'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="学分">{course.creditHours}</Descriptions.Item>
          <Descriptions.Item label="选课人数">
            {course.enrolledCount || 0} / {course.capacity || 0}
          </Descriptions.Item>
          <Descriptions.Item label="讲师">{course.instructorName || course.instructorId}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={course.status === 'PUBLISHED' ? 'green' : 'default'}>
              {course.status || 'DRAFT'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="课程简介" span={3}>
            {course.description || '暂无简介'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey="syllabus"
        items={[
          {
            key: 'syllabus',
            label: <span><ReadOutlined /> 教学大纲</span>,
            children: (
              <Card>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {course.syllabus || '暂无大纲内容'}
                </div>
              </Card>
            ),
          },
          {
            key: 'resources',
            label: <span><FolderOpenOutlined /> 课程资源</span>,
            children: <Card>资源列表（开发中）</Card>,
          },
          {
            key: 'discussions',
            label: <span><TeamOutlined /> 讨论区</span>,
            children: <Card>讨论区（开发中）</Card>,
          },
        ]}
      />
    </div>
  );
};

export default CourseDetail;