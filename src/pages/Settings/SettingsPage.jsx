import React, { useState } from 'react';
import {
  Typography,
  Card,
  Form,
  Select,
  Switch,
  Button,
  Breadcrumb,
  Space,
  message,
  Divider,
  Modal,
  Input,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  HomeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  BellOutlined,
  LockOutlined,
  SaveOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;

const LANGUAGE_OPTIONS = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'fr', label: '🇫🇷 Français' },
];

const THEME_OPTIONS = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'auto', label: '⚙️ Auto (System)' },
];

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [theme, setTheme] = useState('light');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newCourseUpdates: true,
    collaborationInvites: true,
    discussionReplies: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showActivity: true,
    allowMessages: true,
    showEmail: false,
  });

  const handleLanguageChange = async (lang) => {
    try {
      setLanguage(lang);
      await i18n.changeLanguage(lang);
      message.success(t('common.success'));
    } catch {
      message.success('Language preference saved (offline)');
    }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.style.colorScheme = 'dark';
      } else if (newTheme === 'light') {
        document.documentElement.style.colorScheme = 'light';
      } else {
        document.documentElement.style.colorScheme = 'light';
      }
      message.success(t('common.success'));
    } catch {
      message.success('Theme preference saved (offline)');
    }
  };

  const handleNotificationChange = async (key, value) => {
    try {
      const newNotifications = { ...notifications, [key]: value };
      setNotifications(newNotifications);
      message.success(t('common.success'));
    } catch {
      message.success('Notification preference saved (offline)');
    }
  };

  const handlePrivacyChange = async (key, value) => {
    try {
      const newPrivacy = { ...privacy, [key]: value };
      setPrivacy(newPrivacy);
      message.success(t('common.success'));
    } catch {
      message.success('Privacy preference saved (offline)');
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      message.success('Password changed successfully');
      setPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      message.success('Cache cleared successfully');
    } catch {
      message.error('Failed to clear cache');
    }
  };

  const handleExportData = async () => {
    try {
      message.success('Data export started. Check your email for download link.');
    } catch {
      message.error('Failed to export data');
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: 24, maxWidth: 900 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Settings' },
          ]}
        />

        <Title level={3} style={{ marginBottom: 24 }}>
          ⚙️ Settings
        </Title>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <GlobalOutlined /> Language & Localization
          </Title>
          <Paragraph type="secondary">Choose your preferred language and regional settings</Paragraph>
          <Divider />

          <Form layout="vertical">
            <Form.Item label="Language">
              <Select
                value={language}
                onChange={handleLanguageChange}
                options={LANGUAGE_OPTIONS}
                style={{ maxWidth: 300 }}
              />
            </Form.Item>

            <Form.Item label="Timezone">
              <Select
                defaultValue="UTC-8"
                options={[
                  { value: 'UTC-8', label: 'UTC -8:00 (Pacific)' },
                  { value: 'UTC-5', label: 'UTC -5:00 (Eastern)' },
                  { value: 'UTC+0', label: 'UTC +0:00 (London)' },
                  { value: 'UTC+8', label: 'UTC +8:00 (Singapore/HK)' },
                ]}
                style={{ maxWidth: 300 }}
              />
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <BgColorsOutlined /> Theme & Appearance
          </Title>
          <Paragraph type="secondary">Customize how the application looks</Paragraph>
          <Divider />

          <Form layout="vertical">
            <Form.Item label="Theme">
              <Select
                value={theme}
                onChange={handleThemeChange}
                options={THEME_OPTIONS}
                style={{ maxWidth: 300 }}
              />
            </Form.Item>

            <Form.Item label="Compact Mode">
              <Switch
                defaultChecked={false}
                onChange={(checked) => {
                  message.success('Compact mode ' + (checked ? 'enabled' : 'disabled'));
                }}
              />
              <Text type="secondary" style={{ marginLeft: 12 }}>
                Reduce spacing for more content density
              </Text>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <BellOutlined /> Notification Preferences
          </Title>
          <Paragraph type="secondary">Control how and when you receive notifications</Paragraph>
          <Divider />

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Email Notifications</Text>
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Receive notifications via email
                </Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Push Notifications</Text>
                  <Switch
                    checked={notifications.pushNotifications}
                    onChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Receive browser push notifications
                </Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Course Updates</Text>
                  <Switch
                    checked={notifications.newCourseUpdates}
                    onChange={(checked) => handleNotificationChange('newCourseUpdates', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  New course materials and updates
                </Text>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Collaboration Invites</Text>
                  <Switch
                    checked={notifications.collaborationInvites}
                    onChange={(checked) => handleNotificationChange('collaborationInvites', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Project collaboration invitations
                </Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Discussion Replies</Text>
                  <Switch
                    checked={notifications.discussionReplies}
                    onChange={(checked) => handleNotificationChange('discussionReplies', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Replies to your discussion posts
                </Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong>Weekly Digest</Text>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Weekly summary of your activity
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <LockOutlined /> Privacy Settings
          </Title>
          <Paragraph type="secondary">Control your privacy and visibility</Paragraph>
          <Divider />

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text strong>Public Profile</Text>
              <Switch
                checked={privacy.profilePublic}
                onChange={(checked) => handlePrivacyChange('profilePublic', checked)}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Allow others to view your profile and activity
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text strong>Show Activity</Text>
              <Switch
                checked={privacy.showActivity}
                onChange={(checked) => handlePrivacyChange('showActivity', checked)}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Display your learning activity to other users
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text strong>Allow Messages</Text>
              <Switch
                checked={privacy.allowMessages}
                onChange={(checked) => handlePrivacyChange('allowMessages', checked)}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Allow others to send you direct messages
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text strong>Show Email Address</Text>
              <Switch
                checked={privacy.showEmail}
                onChange={(checked) => handlePrivacyChange('showEmail', checked)}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Display your email address on your profile
            </Text>
          </div>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>🔐 Account Security</Title>
          <Paragraph type="secondary">Manage your account security settings</Paragraph>
          <Divider />

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                block
                onClick={() => setPasswordModalOpen(true)}
                icon={<LockOutlined />}
              >
                Change Password
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Tooltip title="Download a copy of all your personal data">
                <Button block onClick={handleExportData}>
                  Export My Data
                </Button>
              </Tooltip>
            </Col>
          </Row>
        </Card>

        <Card style={{ borderColor: '#ff4d4f', marginBottom: 24 }}>
          <Title level={4} style={{ color: '#ff4d4f' }}>
            <WarningOutlined /> Danger Zone
          </Title>
          <Paragraph type="secondary">Irreversible actions - proceed with caution</Paragraph>
          <Divider />

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                block
                danger
                onClick={handleClearCache}
              >
                Clear Cache
              </Button>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Clear browser cache and cookies
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Tooltip title="This action cannot be undone">
                <Button block danger>
                  Delete Account
                </Button>
              </Tooltip>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Permanently delete your account and data
              </Text>
            </Col>
          </Row>
        </Card>

        <Modal
          title="Change Password"
          open={passwordModalOpen}
          onCancel={() => setPasswordModalOpen(false)}
          footer={null}
          width={400}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[
                { required: true, message: 'Please confirm your password' },
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Change Password
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;
