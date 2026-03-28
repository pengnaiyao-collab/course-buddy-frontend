import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Avatar,
  Tag,
  Typography,
  Space,
  Badge,
  Tooltip,
} from 'antd';
import {
  FileOutlined,
  BulbOutlined,
  TeamOutlined,
  CloudServerOutlined,
  UploadOutlined,
  PlusOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  L1: { label: 'Course Admin', color: 'red' },
  L2: { label: 'Core Collaborator', color: 'orange' },
  L3: { label: 'Enrolled Member', color: 'blue' },
  L4: { label: 'Campus Visitor', color: 'default' },
};

const MOCK_STATS = {
  totalFiles: 148,
  knowledgePoints: 312,
  members: 27,
  storageUsed: 2.4,
};

const FILE_ICON_MAP = {
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
  doc: <FileWordOutlined style={{ color: '#1677ff' }} />,
  docx: <FileWordOutlined style={{ color: '#1677ff' }} />,
  xls: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  xlsx: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  ppt: <FilePptOutlined style={{ color: '#fa8c16' }} />,
  pptx: <FilePptOutlined style={{ color: '#fa8c16' }} />,
  jpg: <FileImageOutlined style={{ color: '#722ed1' }} />,
  png: <FileImageOutlined style={{ color: '#722ed1' }} />,
};

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICON_MAP[ext] || <FileOutlined style={{ color: '#8c8c8c' }} />;
};

const MOCK_RECENT_FILES = [
  { id: 1, name: 'Lecture_01_Introduction.pdf', uploader: 'Prof. Chen', uploadedAt: '2024-03-15 10:23', size: '3.2 MB', status: 'success' },
  { id: 2, name: 'Week3_Algorithms.pptx', uploader: 'Alice Wang', uploadedAt: '2024-03-14 16:05', size: '8.7 MB', status: 'success' },
  { id: 3, name: 'Lab2_DataStructures.docx', uploader: 'Bob Liu', uploadedAt: '2024-03-14 09:45', size: '1.1 MB', status: 'success' },
  { id: 4, name: 'Assignment3_Solution.pdf', uploader: 'Carol Zhang', uploadedAt: '2024-03-13 22:10', size: '0.9 MB', status: 'success' },
  { id: 5, name: 'Dataset_Training.xlsx', uploader: 'Prof. Chen', uploadedAt: '2024-03-13 14:30', size: '15.4 MB', status: 'success' },
  { id: 6, name: 'Diagram_SystemArch.png', uploader: 'Alice Wang', uploadedAt: '2024-03-12 11:20', size: '2.3 MB', status: 'success' },
  { id: 7, name: 'Notes_Week4.md', uploader: 'David Kim', uploadedAt: '2024-03-12 08:55', size: '0.2 MB', status: 'success' },
  { id: 8, name: 'Reference_Papers.zip', uploader: 'Prof. Chen', uploadedAt: '2024-03-11 17:40', size: '42.1 MB', status: 'success' },
];

function KnowledgeBaseDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setRecentFiles(MOCK_RECENT_FILES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const currentRole = 'L2';
  const roleConfig = ROLE_CONFIG[currentRole];

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Knowledge Base
            </Title>
            <Text type="secondary">Manage course materials, knowledge points and permissions</Text>
          </div>
          <Space>
            <Tag color={roleConfig.color} style={{ fontSize: 13, padding: '4px 10px' }}>
              {currentRole} · {roleConfig.label}
            </Tag>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title="Total Files"
                value={stats.totalFiles}
                prefix={<FileOutlined style={{ color: '#1677ff' }} />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title="Knowledge Points"
                value={stats.knowledgePoints}
                prefix={<BulbOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title="Members"
                value={stats.members}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic
                title="Storage Used"
                value={stats.storageUsed}
                suffix="GB"
                prefix={<CloudServerOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title="Quick Actions"
        >
          <Space wrap size="middle">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              onClick={() => navigate('/kb/upload')}
            >
              Upload File
            </Button>
            <Button
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/kb/knowledge')}
            >
              Add Knowledge Point
            </Button>
            <Button
              icon={<SafetyOutlined />}
              size="large"
              onClick={() => navigate('/kb/permissions')}
            >
              Manage Permissions
            </Button>
            <Button
              icon={<FileOutlined />}
              size="large"
              onClick={() => navigate('/kb/files')}
            >
              Browse Files
            </Button>
            <Button
              icon={<ClockCircleOutlined />}
              size="large"
              onClick={() => navigate('/kb/versions')}
            >
              Version History
            </Button>
          </Space>
        </Card>

        {/* Recent Uploads */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title="Recent Uploads"
          extra={
            <Button type="link" onClick={() => navigate('/kb/files')}>
              View all <ArrowRightOutlined />
            </Button>
          }
        >
          <List
            loading={loading}
            dataSource={recentFiles}
            renderItem={(file) => (
              <List.Item
                key={file.id}
                style={{ padding: '8px 0' }}
                extra={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {file.size}
                  </Text>
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getFileIcon(file.name)}
                      style={{ background: '#f0f0f0' }}
                      shape="square"
                    />
                  }
                  title={
                    <Text style={{ fontSize: 14 }} ellipsis>
                      {file.name}
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {file.uploader} · {file.uploadedAt}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </AppLayout>
  );
}

export default KnowledgeBaseDashboard;
