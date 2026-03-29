import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../../store/slices/authSlice';
import { login, register } from '../../services/api/auth';

const { Title } = Typography;

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleLogin = async (values) => {
    dispatch(setLoading(true));
    try {
      const response = await login(values);
      // API returns { code, message, data: { token, tokenType, userId, username, email, role } }
      const { token, ...userInfo } = response.data?.data || {};
      dispatch(setCredentials({ token, user: userInfo }));
      message.success('Login successful!');
      navigate('/courses');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(setError(errorMsg));
      message.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRegister = async (values) => {
    dispatch(setLoading(true));
    try {
      await register(values);
      message.success('Registration successful! Please log in.');
      setActiveTab('login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(setError(errorMsg));
      message.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loginForm = (
    <Form name="login" onFinish={handleLogin} size="large" layout="vertical">
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please enter your username' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Log In
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form name="register" onFinish={handleRegister} size="large" layout="vertical">
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please enter a username' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter a password' },
          { min: 6, message: 'Password must be at least 6 characters' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Register
        </Button>
      </Form.Item>
    </Form>
  );

  const tabs = [
    { key: 'login', label: 'Log In', children: loginForm },
    { key: 'register', label: 'Register', children: registerForm },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <Title level={2} className="!mb-1">
            📚 Course Buddy
          </Title>
          <p className="text-gray-500">Your intelligent learning companion</p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabs}
        />
      </Card>
    </div>
  );
}

export default LoginPage;
