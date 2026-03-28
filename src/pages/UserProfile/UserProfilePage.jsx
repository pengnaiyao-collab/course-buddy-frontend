import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  Spin,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAvatar,
} from '../../services/api/userProfile';
import { setProfile, setLoading, setError } from '../../store/slices/userSlice';

const { Title, Text, Paragraph } = Typography;

const MOCK_PROFILE = {
  id: 1,
  username: 'student01',
  displayName: 'Alex Chen',
  email: 'alex.chen@university.edu',
  phone: '+86 138 0000 0000',
  bio: 'Computer Science student passionate about AI and web development.',
  major: 'Computer Science',
  studentId: '2021001001',
  department: 'School of Computer Science',
  role: 'Student',
  joinDate: '2021-09-01',
  avatarUrl: null,
  achievements: ['Early Adopter', 'Top Contributor', 'Perfect Score'],
};

function UserProfilePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      dispatch(setLoading(true));
      try {
        const res = await getUserProfile();
        dispatch(setProfile(res.data));
      } catch {
        // Fallback to mock data in development
        dispatch(setProfile(MOCK_PROFILE));
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile);
    }
  }, [profile, form]);

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    form.setFieldsValue(profile);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateUserProfile(values);
      dispatch(setProfile({ ...profile, ...values }));
      message.success(t('profile.updateSuccess'));
      setEditing(false);
    } catch (err) {
      if (err?.errorFields) return; // validation error
      message.error(t('profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async ({ file }) => {
    try {
      const res = await uploadAvatar(file);
      dispatch(setProfile({ ...profile, avatarUrl: res.data.url }));
      message.success(t('profile.updateSuccess'));
    } catch {
      message.error(t('profile.updateFailed'));
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      dispatch(setProfile({ ...profile, avatarUrl: null }));
      message.success(t('profile.updateSuccess'));
    } catch {
      message.error(t('profile.updateFailed'));
    }
  };

  if (loading && !profile) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  const displayProfile = profile || MOCK_PROFILE;

  return (
    <AppLayout>
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
              {t('profile.title')}
            </Title>
            <Text style={{ color: 'var(--text-secondary)' }}>{t('profile.subtitle')}</Text>
          </div>
          {!editing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              {t('profile.editProfile')}
            </Button>
          ) : (
            <Space>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                {t('profile.saveProfile')}
              </Button>
            </Space>
          )}
        </div>

        <Row gutter={[24, 24]}>
          {/* Avatar + basic info */}
          <Col xs={24} md={8}>
            <Card
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Avatar
                  size={100}
                  src={displayProfile.avatarUrl}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 12 }}
                />
                <div>
                  <Title level={4} style={{ margin: '8px 0 4px', color: 'var(--text-primary)' }}>
                    {displayProfile.displayName}
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)' }}>@{displayProfile.username}</Text>
                </div>
                <Tag color="blue" style={{ marginTop: 8 }}>
                  {displayProfile.role}
                </Tag>
              </div>
              <Space>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => { handleAvatarUpload({ file }); return false; }}
                >
                  <Button size="small" icon={<CameraOutlined />}>
                    {t('profile.changeAvatar')}
                  </Button>
                </Upload>
                {displayProfile.avatarUrl && (
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteAvatar}
                  >
                    {t('profile.removeAvatar')}
                  </Button>
                )}
              </Space>

              <Divider />
              <div style={{ textAlign: 'left' }}>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {t('profile.joinDate')}
                </Text>
                <div>
                  <Text style={{ color: 'var(--text-primary)' }}>{displayProfile.joinDate}</Text>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            {displayProfile.achievements?.length > 0 && (
              <Card
                title={t('profile.achievements')}
                style={{
                  marginTop: 16,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Space wrap>
                  {displayProfile.achievements.map((a) => (
                    <Tag key={a} color="gold">
                      {a}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </Col>

          {/* Edit form */}
          <Col xs={24} md={16}>
            <Card
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Form form={form} layout="vertical" disabled={!editing}>
                <Title level={5} style={{ color: 'var(--text-primary)' }}>
                  {t('profile.basicInfo')}
                </Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.displayName')} name="displayName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.username')} name="username">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label={t('profile.bio')} name="bio">
                  <Input.TextArea rows={3} maxLength={200} showCount />
                </Form.Item>

                <Divider />
                <Title level={5} style={{ color: 'var(--text-primary)' }}>
                  {t('profile.contactInfo')}
                </Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.email')} name="email">
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.phone')} name="phone">
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />
                <Title level={5} style={{ color: 'var(--text-primary)' }}>
                  {t('profile.academicInfo')}
                </Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.major')} name="major">
                      <Input prefix={<BookOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('profile.studentId')} name="studentId">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label={t('profile.department')} name="department">
                  <Input />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}

export default UserProfilePage;
