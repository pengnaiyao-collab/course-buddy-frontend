import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Radio,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  List,
  Tag,
} from 'antd';
import {
  LockOutlined,
  EyeOutlined,
  BellOutlined,
  DesktopOutlined,
  UserDeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';
import { updateSettings, setLanguage, setTheme } from '../../store/slices/settingsSlice';
import { changePassword } from '../../services/api/settings';
import { changeLanguage } from '../../i18n/i18n';
import { useTheme } from '../../theme/ThemeContext';
import { THEMES } from '../../theme/themes';

const { Title, Text } = Typography;

const FONT_SIZES = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const TIMEZONES = [
  'UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'America/New_York',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
];

function SettingsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const { switchTheme } = useTheme();
  const [pwForm] = Form.useForm();
  const [changingPw, setChangingPw] = useState(false);

  const handleSettingChange = (key, value) => {
    dispatch(updateSettings({ [key]: value }));
    if (key === 'language') {
      changeLanguage(value);
      dispatch(setLanguage(value));
    }
    if (key === 'theme') {
      switchTheme(value);
      dispatch(setTheme(value));
    }
  };

  const handleSaveSettings = () => {
    message.success(t('settings.settingsSaved'));
  };

  const handleChangePassword = async () => {
    try {
      const values = await pwForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error(t('settings.passwordMismatch'));
        return;
      }
      setChangingPw(true);
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success(t('settings.passwordChanged'));
      pwForm.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(t('common.error'));
    } finally {
      setChangingPw(false);
    }
  };

  const cardStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    marginBottom: 16,
  };

  const tabItems = [
    {
      key: 'account',
      label: (
        <span>
          <LockOutlined /> {t('settings.account')}
        </span>
      ),
      children: (
        <div>
          <Card title={t('settings.changePassword')} style={cardStyle}>
            <Form form={pwForm} layout="vertical" style={{ maxWidth: 480 }}>
              <Form.Item
                label={t('settings.currentPassword')}
                name="currentPassword"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label={t('settings.newPassword')}
                name="newPassword"
                rules={[{ required: true, min: 8 }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label={t('settings.confirmPassword')}
                name="confirmPassword"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>
              <Button type="primary" loading={changingPw} onClick={handleChangePassword}>
                {t('settings.changePassword')}
              </Button>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'privacy',
      label: (
        <span>
          <EyeOutlined /> {t('settings.privacy')}
        </span>
      ),
      children: (
        <div>
          <Card title={t('settings.profileVisibility')} style={cardStyle}>
            <Form layout="vertical">
              <Form.Item label={t('settings.profileVisibility')}>
                <Radio.Group
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                >
                  <Radio value="public">{t('settings.public')}</Radio>
                  <Radio value="friends">{t('settings.friendsOnly')}</Radio>
                  <Radio value="private">{t('settings.private')}</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label={t('settings.activityDisplay')}>
                <Switch
                  checked={settings.showActivity}
                  onChange={(v) => handleSettingChange('showActivity', v)}
                />
              </Form.Item>
            </Form>
          </Card>
          <Card title={t('settings.dataExport')} style={cardStyle}>
            <Button icon={<DownloadOutlined />}>{t('settings.dataExport')}</Button>
          </Card>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> {t('settings.notifications')}
        </span>
      ),
      children: (
        <div>
          <Card title={t('settings.notificationType')} style={cardStyle}>
            <List>
              {[
                ['emailNotifications', t('settings.notificationMethod') + ' (Email)'],
                ['appNotifications', t('settings.notificationMethod') + ' (App)'],
                ['courseNotifications', t('nav.courseLibrary')],
                ['collaborationNotifications', t('nav.collaboration')],
                ['systemNotifications', 'System'],
              ].map(([key, label]) => (
                <List.Item
                  key={key}
                  extra={
                    <Switch
                      checked={settings[key]}
                      onChange={(v) => handleSettingChange(key, v)}
                    />
                  }
                >
                  <Text style={{ color: 'var(--text-primary)' }}>{label}</Text>
                </List.Item>
              ))}
            </List>
          </Card>
        </div>
      ),
    },
    {
      key: 'display',
      label: (
        <span>
          <DesktopOutlined /> {t('settings.display')}
        </span>
      ),
      children: (
        <div>
          <Card title={t('settings.display')} style={cardStyle}>
            <Form layout="vertical">
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('settings.language')}>
                    <Select
                      value={settings.language}
                      onChange={(v) => handleSettingChange('language', v)}
                      options={[
                        { value: 'en_US', label: 'English' },
                        { value: 'zh_CN', label: '中文' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('settings.theme')}>
                    <Select
                      value={settings.theme}
                      onChange={(v) => handleSettingChange('theme', v)}
                      options={[
                        { value: THEMES.LIGHT, label: t('theme.light') },
                        { value: THEMES.DARK, label: t('theme.dark') },
                        { value: THEMES.AUTO, label: t('theme.auto') },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('settings.fontSize')}>
                    <Select
                      value={settings.fontSize}
                      onChange={(v) => handleSettingChange('fontSize', v)}
                      options={FONT_SIZES}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={t('settings.timezone')}>
                    <Select
                      value={settings.timezone}
                      onChange={(v) => handleSettingChange('timezone', v)}
                      options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Button type="primary" onClick={handleSaveSettings}>
              {t('settings.saveSettings')}
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
            {t('settings.title')}
          </Title>
          <Text style={{ color: 'var(--text-secondary)' }}>{t('settings.subtitle')}</Text>
        </div>
        <Tabs items={tabItems} type="card" />
      </div>
    </AppLayout>
  );
}

export default SettingsPage;
