import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Form,
  Input,
  Avatar,
  Breadcrumb,
  Space,
  Divider,
  Tabs,
  Row,
  Col,
  Statistic,
  Upload,
  message,
  Modal,
  List,
  Tag,
  Spin,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  CameraOutlined,
  EditOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BookOutlined,
  HeartOutlined,
  TeamOutlined,
  AntDesignOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;

const SAMPLE_PROFILE = {
  id: 1,
  username: 'john_doe',
  realName: 'John Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8900',
  bio: 'Computer Science student passionate about learning',
  location: 'San Francisco, CA',
  avatar: null,
  joinDate: '2024-01-15',
  followers: 128,
  following: 45,
  notesCount: 32,
  coursesEnrolled: 8,
  collaborationsCount: 5,
  discussionsCount: 23,
};

const SAMPLE_FOLLOWERS = [
  { id: 1, username: 'alice_wang', realName: 'Alice Wang', avatar: null },
  { id: 2, username: 'bob_liu', realName: 'Bob Liu', avatar: null },
  { id: 3, username: 'carol_zhang', realName: 'Carol Zhang', avatar: null },
];

const SAMPLE_FOLLOWING = [
  { id: 4, username: 'prof_chen', realName: 'Prof. Chen', avatar: null },
  { id: 5, username: 'david_kim', realName: 'David Kim', avatar: null },
];

function UserProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(SAMPLE_PROFILE);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [followers, setFollowers] = useState(SAMPLE_FOLLOWERS);
  const [following, setFollowing] = useState(SAMPLE_FOLLOWING);
  const [followersLoading, setFollowersLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      realName: profile.realName,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      location: profile.location,
    });
  }, [profile, form]);

  const handleEditProfile = async (values) => {
    setLoading(true);
    try {
      // TODO: Call API to update profile
      setProfile((prev) => ({ ...prev, ...values }));
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch {
      message.success('Profile updated (offline)');
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // TODO: Call API to upload avatar
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile((prev) => ({ ...prev, avatar: e.target.result }));
        message.success('Avatar updated successfully');
      };
      reader.readAsDataURL(file);
    } catch {
      message.success('Avatar updated (offline)');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleFollowUser = async (userId) => {
    try {
      // TODO: Call API to follow user
      setProfile((prev) => ({
        ...prev,
        following: prev.following + 1,
      }));
      message.success('User followed');
    } catch {
      message.success('User followed (offline)');
    }
  };

  const handleLoadFollowers = async () => {
    setFollowersLoading(true);
    try {
      // TODO: Call API to load followers
      setFollowers(SAMPLE_FOLLOWERS);
    } catch {
      setFollowers(SAMPLE_FOLLOWERS);
    } finally {
      setFollowersLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Profile' },
          ]}
        />

        {/* Profile Header */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={profile.avatar}
                  style={{ background: '#1677ff' }}
                />
                {editMode && (
                  <Upload
                    maxCount={1}
                    customRequest={({ file }) => handleAvatarUpload(file)}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      type="primary"
                      icon={<CameraOutlined />}
                      shape="circle"
                      size="large"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                      }}
                      loading={uploading}
                    />
                  </Upload>
                )}
              </div>
              <div style={{ marginBottom: 16 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                  {profile.realName}
                </Title>
                <Text type="secondary">@{profile.username}</Text>
              </div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">
                  <EnvironmentOutlined /> {profile.location}
                </Text>
                <Text type="secondary">
                  Joined {new Date(profile.joinDate).toLocaleDateString()}
                </Text>
              </Space>
            </Col>

            <Col xs={24} sm={18}>
              {editMode ? (
                <Form form={form} layout="vertical" onFinish={handleEditProfile}>
                  <Form.Item
                    name="realName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Full name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Invalid email format' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email address" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ message: 'Invalid phone format' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
                  </Form.Item>
                  <Form.Item name="location" label="Location">
                    <Input prefix={<EnvironmentOutlined />} placeholder="City, Country" />
                  </Form.Item>
                  <Form.Item name="bio" label="Bio">
                    <Input.TextArea
                      placeholder="Write a short bio about yourself"
                      rows={3}
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setEditMode(false)}>Cancel</Button>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Space>
                </Form>
              ) : (
                <>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Text strong style={{ fontSize: 16 }}>
                        {profile.bio}
                      </Text>
                    </Col>
                    <Col span={24}>
                      <Space>
                        {profile.email && (
                          <Text type="secondary">
                            <MailOutlined /> {profile.email}
                          </Text>
                        )}
                        {profile.phone && (
                          <Text type="secondary">
                            <PhoneOutlined /> {profile.phone}
                          </Text>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Followers"
                        value={profile.followers}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Following"
                        value={profile.following}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                      <Button type="primary" onClick={() => setEditMode(true)} icon={<EditOutlined />}>
                        Edit Profile
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Card>

        {/* Statistics and Tabs */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Notes Created"
                value={profile.notesCount}
                prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Courses Enrolled"
                value={profile.coursesEnrolled}
                prefix={<BookOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Collaborations"
                value={profile.collaborationsCount}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Discussions"
                value={profile.discussionsCount}
                prefix={<AntDesignOutlined style={{ color: '#f5222d' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Followers/Following Tabs */}
        <Card>
          <Tabs
            defaultActiveKey="followers"
            items={[
              {
                key: 'followers',
                label: `👥 Followers (${profile.followers})`,
                children: (
                  <div>
                    {followersLoading ? (
                      <div style={{ textAlign: 'center', padding: 24 }}>
                        <Spin />
                      </div>
                    ) : followers.length === 0 ? (
                      <Empty description="No followers yet" />
                    ) : (
                      <List
                        dataSource={followers}
                        renderItem={(follower) => (
                          <List.Item
                            actions={[
                              <Button type="link" size="small">
                                View Profile
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={follower.avatar}
                                  style={{ background: '#1677ff' }}
                                />
                              }
                              title={
                                <div>
                                  <Text strong>{follower.realName}</Text>
                                  <Text type="secondary" style={{ marginLeft: 8 }}>
                                    @{follower.username}
                                  </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'following',
                label: `➜ Following (${profile.following})`,
                children: (
                  <div>
                    {following.length === 0 ? (
                      <Empty description="Not following anyone yet" />
                    ) : (
                      <List
                        dataSource={following}
                        renderItem={(user) => (
                          <List.Item
                            actions={[
                              <Button type="link" size="small">
                                View Profile
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={user.avatar}
                                  style={{ background: '#1677ff' }}
                                />
                              }
                              title={
                                <div>
                                  <Text strong>{user.realName}</Text>
                                  <Text type="secondary" style={{ marginLeft: 8 }}>
                                    @{user.username}
                                  </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AppLayout>
  );
}

export default UserProfilePage;
