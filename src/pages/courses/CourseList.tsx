import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space, Typography, Spin } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import request from '@/utils/request';

import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  instructorId: number;
  creditHours: number;
  level: string;
  capacity: number;
  enrolledCount: number;
  thumbnailUrl: string;
  status: string;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // API端点参考了 CourseCatalogController: GET /v1/courses-catalog
      const res: any = await request.get('/api/v1/courses-catalog');
      // 后端返回的分页数据通常在 res.data.content 中
      setCourses(res.data?.content || res.content || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>课程列表</Title>
        <Button type="primary" icon={<PlusOutlined />}>创建课程</Button>
      </div>

      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
          dataSource={courses}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.name}
                    src={item.thumbnailUrl || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
                    style={{ height: 150, objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Button type="link" key="view" onClick={() => navigate(`/courses/${item.id}`)}>查看详情</Button>,
                  <Button type="link" key="enroll">加入课程</Button>,
                ]}
              >
                <Card.Meta
                  title={item.name}
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8, height: 44 }}>
                        {item.description || '暂无描述'}
                      </Paragraph>
                      <Space wrap size={[0, 8]}>
                        <Tag color="blue">{item.level || 'BEGINNER'}</Tag>
                        <Tag color="green">{item.creditHours || 0} 学分</Tag>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          <UserOutlined /> {item.enrolledCount || 0}/{item.capacity || 0}
                        </span>
                      </Space>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default CourseList;