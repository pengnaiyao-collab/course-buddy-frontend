import React, { useEffect, useState } from 'react';
import { Card, List, Button, Avatar, Space, Typography, Tag, Modal, Form, Input } from 'antd';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';

const { Title, Paragraph } = Typography;

interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  courseId?: number;
  projectId?: number;
  ownerName?: string;
  createdAt: string;
}

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res: any = await request.get('/api/teams');
      setTeams(res.data?.content || res.content || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (values: any) => {
    try {
      setLoading(true);
      await request.post('/api/teams', values);
      setIsModalVisible(false);
      form.resetFields();
      fetchTeams();
    } catch (error) {
      // 错误已拦截处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>我的学习小组</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          创建小组
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={teams}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button type="link" onClick={() => navigate(`/teams/${item.id}`)}>查看详情</Button>,
                <Button type="link" onClick={() => navigate(`/collaboration/${item.projectId || 'new'}`)}>进入协作</Button>
              ]}
            >
              <Card.Meta
                avatar={<Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                title={item.name}
                description={
                  <div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ height: 44, marginBottom: 8 }}>
                      {item.description || '暂无描述'}
                    </Paragraph>
                    <Space>
                      <Tag color="blue">{item.memberCount || 1} 人</Tag>
                      {item.courseId && <Tag color="green">关联课程</Tag>}
                    </Space>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="创建学习小组"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTeam}>
          <Form.Item
            name="name"
            label="小组名称"
            rules={[{ required: true, message: '请输入小组名称' }]}
          >
            <Input placeholder="例如：Java 期末冲刺小分队" />
          </Form.Item>
          <Form.Item name="description" label="小组简介">
            <Input.TextArea rows={4} placeholder="描述一下你们的学习目标..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamList;