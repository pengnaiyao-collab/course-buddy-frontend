import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Tag, Button, Input, Form, message, Modal } from 'antd';
import { useParams } from 'react-router-dom';
import { UserOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInviteVisible, setIsInviteVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const resTeam: any = await request.get(`/api/teams/${id}`);
      setTeam(resTeam.data || resTeam);
      
      const resMembers: any = await request.get(`/api/teams/${id}/members`);
      setMembers(resMembers.data || resMembers);
    } catch (error) {
      console.error('Failed to fetch team data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  const handleAddMember = async (values: any) => {
    try {
      await request.post(`/api/teams/${id}/members`, {
        userId: Number(values.userId), // 实际业务中可能是根据邮箱/学号搜索出userId
        role: 'MEMBER'
      });
      message.success('成员添加成功');
      setIsInviteVisible(false);
      form.resetFields();
      fetchTeamData();
    } catch (error) {
      // 错误拦截器处理
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await request.delete(`/api/teams/${id}/members/${userId}`);
      message.success('成员移除成功');
      fetchTeamData();
    } catch (error) {
      // 错误拦截器处理
    }
  };

  if (!team) return <Card loading={true} />;

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Card.Meta
          title={<h2 style={{ margin: 0 }}>{team.name}</h2>}
          description={
            <div style={{ marginTop: 16 }}>
              <p>{team.description || '暂无简介'}</p>
              <Tag color="blue">创建时间: {new Date(team.createdAt).toLocaleDateString()}</Tag>
              {team.courseId && <Tag color="green">关联课程ID: {team.courseId}</Tag>}
            </div>
          }
        />
      </Card>

      <Card
        title="小组成员"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsInviteVisible(true)}>
            邀请成员
          </Button>
        }
      >
        <List
          loading={loading}
          dataSource={members}
          renderItem={(item) => (
            <List.Item
              actions={[
                item.role !== 'OWNER' && (
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveMember(item.userId)}>
                    移除
                  </Button>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={item.username || `用户 ${item.userId}`}
                description={
                  <Tag color={item.role === 'OWNER' ? 'gold' : 'default'}>
                    {item.role === 'OWNER' ? '组长' : '组员'}
                  </Tag>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="邀请成员"
        open={isInviteVisible}
        onCancel={() => setIsInviteVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddMember}>
          <Form.Item
            name="userId"
            label="用户 ID (演示使用)"
            rules={[{ required: true, message: '请输入要邀请的用户ID' }]}
            extra="实际应用中通常是输入用户名或邮箱搜索"
          >
            <Input placeholder="输入目标用户 ID" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>确认添加</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamDetail;