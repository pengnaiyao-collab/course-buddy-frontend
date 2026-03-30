import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Typography, Spin, Space } from 'antd';
import { BookOutlined, TeamOutlined, EditOutlined, ReadOutlined, FieldTimeOutlined, FlagOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsCount: 0,
    teamsCount: 0,
    totalStudyMinutes: 0,
    averageProgress: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 由于没有找到专门的 Dashboard 接口，这里模拟并行调用多个接口聚合数据
        const [coursesRes, teamsRes]: any = await Promise.all([
          request.get('/api/v1/courses-catalog'),
          request.get('/api/teams'),
          // 尝试获取未读通知等，这里暂用已有数据替代
          Promise.resolve({ data: { content: [] } })
        ]);

        setStats({
          coursesCount: coursesRes?.data?.content?.length || coursesRes?.content?.length || 0,
          teamsCount: teamsRes?.data?.content?.length || teamsRes?.content?.length || 0,
          assignmentsCount: 2, // 模拟数据
          totalStudyMinutes: 360, // 模拟数据
          averageProgress: 45, // 模拟数据
          unreadNotifications: 3, // 模拟数据
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={2} style={{ margin: 0 }}>
          欢迎回来, {user.username || '同学'}! 
        </Title>
        <Space>
          <span style={{ color: '#888' }}>{new Date().toLocaleDateString()}</span>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)' }}>
              <Statistic
                title="我的课程"
                value={stats.coursesCount}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ background: 'linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)' }}>
              <Statistic
                title="待完成作业"
                value={stats.assignmentsCount}
                valueStyle={{ color: '#cf1322' }}
                prefix={<EditOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #ffc069 100%)' }}>
              <Statistic
                title="参与学习小组"
                value={stats.teamsCount}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>
              <Statistic
                title="累计学习时长"
                value={stats.totalStudyMinutes}
                suffix="分钟"
                prefix={<FieldTimeOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>
              <Statistic
                title="平均课程进度"
                value={stats.averageProgress}
                suffix="%"
                prefix={<FlagOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable>
              <Statistic
                title="未读消息通知"
                value={stats.unreadNotifications}
                prefix={<ReadOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;