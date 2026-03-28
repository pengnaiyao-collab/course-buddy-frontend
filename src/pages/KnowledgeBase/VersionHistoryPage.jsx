import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Popconfirm,
  message,
  Divider,
  Badge,
  Row,
  Col,
  Tooltip,
  Alert,
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  DiffOutlined,
  RollbackOutlined,
  RobotOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;

const MOCK_FILES = [
  { id: '1', name: 'Lecture_01_Introduction.pdf' },
  { id: '2', name: 'Week3_Algorithms.pptx' },
  { id: '3', name: 'Lab2_DataStructures.docx' },
  { id: '4', name: 'Assignment3_Solution.pdf' },
];

const MOCK_VERSIONS = {
  '1': [
    { id: 'v1_4', version: 'v4', description: 'Added section on complexity theory', author: 'Prof. Chen', timestamp: '2024-03-15 10:23', size: '3.2 MB', isAI: false,
      content: 'Introduction to Computer Science\n\nThis lecture covers the fundamentals of computer science, including algorithms, data structures, and complexity theory.\n\nSection 1: What is Computer Science?\nSection 2: Algorithms Overview\nSection 3: Data Structures\nSection 4: Complexity Theory (NEW)' },
    { id: 'v1_3', version: 'v3', description: 'Revised algorithm examples', author: 'Alice Wang', timestamp: '2024-03-12 14:10', size: '3.0 MB', isAI: false,
      content: 'Introduction to Computer Science\n\nThis lecture covers the fundamentals of computer science, including algorithms and data structures.\n\nSection 1: What is Computer Science?\nSection 2: Algorithms Overview (REVISED)\nSection 3: Data Structures' },
    { id: 'v1_2', version: 'v2', description: 'AI-generated summary added', author: 'AI Assistant', timestamp: '2024-03-10 09:00', size: '2.8 MB', isAI: true,
      content: 'Introduction to Computer Science\n\nThis lecture covers the fundamentals of computer science.\n\nSection 1: What is Computer Science?\nSection 2: Algorithms Overview\n\n[AI-generated summary: This document introduces core CS concepts...]' },
    { id: 'v1_1', version: 'v1', description: 'Initial upload', author: 'Prof. Chen', timestamp: '2024-03-08 08:00', size: '2.5 MB', isAI: false,
      content: 'Introduction to Computer Science\n\nThis lecture covers the fundamentals of computer science.\n\nSection 1: What is Computer Science?\nSection 2: Algorithms Overview' },
  ],
  '2': [
    { id: 'v2_3', version: 'v3', description: 'Updated slide 15-20', author: 'Prof. Chen', timestamp: '2024-03-14 16:05', size: '8.7 MB', isAI: false,
      content: 'Week 3: Algorithms\n\nSlide 1: Overview\nSlide 15-20: Sorting Algorithms (UPDATED)\n- Bubble Sort\n- Quick Sort\n- Merge Sort' },
    { id: 'v2_2', version: 'v2', description: 'Added practice problems', author: 'Bob Liu', timestamp: '2024-03-11 11:30', size: '8.2 MB', isAI: false,
      content: 'Week 3: Algorithms\n\nSlide 1: Overview\nSlide 15: Sorting Algorithms\nPractice Problems (NEW)' },
    { id: 'v2_1', version: 'v1', description: 'Initial upload', author: 'Prof. Chen', timestamp: '2024-03-09 10:00', size: '7.9 MB', isAI: false,
      content: 'Week 3: Algorithms\n\nSlide 1: Overview\nSlide 15: Sorting Algorithms' },
  ],
  '3': [
    { id: 'v3_2', version: 'v2', description: 'Fixed typos, added diagrams', author: 'Carol Zhang', timestamp: '2024-03-14 09:45', size: '1.1 MB', isAI: false,
      content: 'Lab 2: Data Structures\n\nObjective: Implement a linked list and binary search tree.\n\nPart 1: Linked List Implementation\nPart 2: BST Implementation (with diagrams)' },
    { id: 'v3_1', version: 'v1', description: 'Initial upload', author: 'Prof. Chen', timestamp: '2024-03-07 14:00', size: '0.9 MB', isAI: false,
      content: 'Lab 2: Data Structures\n\nObjective: Implement a linked list and binary search tree.\n\nPart 1: Linked List Implementation\nPart 2: BST Implementation' },
  ],
  '4': [
    { id: 'v4_1', version: 'v1', description: 'Initial upload', author: 'Carol Zhang', timestamp: '2024-03-13 22:10', size: '0.9 MB', isAI: false,
      content: 'Assignment 3 Solution\n\nProblem 1: Sort the following array using merge sort...\nSolution: [detailed solution]' },
  ],
};

function VersionHistoryPage() {
  const [selectedFileId, setSelectedFileId] = useState('1');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [compareModal, setCompareModal] = useState(null);
  const [compareVersionA, setCompareVersionA] = useState(null);
  const [compareVersionB, setCompareVersionB] = useState(null);

  useEffect(() => {
    if (!selectedFileId) return;
    setLoading(true);
    setTimeout(() => {
      setVersions(MOCK_VERSIONS[selectedFileId] || []);
      setLoading(false);
    }, 400);
  }, [selectedFileId]);

  const handleRollback = (version) => {
    message.success(`Rolled back to ${version.version} — a new version has been created`);
    const newVersion = {
      ...versions[0],
      id: `rollback_${Date.now()}`,
      version: `v${versions.length + 1}`,
      description: `Rollback to ${version.version}`,
      author: 'Me',
      timestamp: new Date().toLocaleString(),
    };
    setVersions((prev) => [newVersion, ...prev]);
  };

  const handleCompare = (versionA, versionB) => {
    setCompareVersionA(versionA);
    setCompareVersionB(versionB);
    setCompareModal(true);
  };

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 90,
      render: (v, r) => (
        <Space>
          <Tag color="blue" style={{ fontFamily: 'monospace' }}>{v}</Tag>
          {r.isAI && (
            <Tooltip title="AI-generated content">
              <Badge count={<RobotOutlined style={{ color: '#722ed1' }} />} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 140,
      render: (author, r) => (
        <Space>
          {r.isAI ? <RobotOutlined style={{ color: '#722ed1' }} /> : <UserOutlined />}
          <Text>{author}</Text>
        </Space>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (v) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
        </Space>
      ),
    },
    { title: 'Size', dataIndex: 'size', key: 'size', width: 90 },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record, index) => (
        <Space>
          <Tooltip title="View content">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewModal(record)}>
              View
            </Button>
          </Tooltip>
          {index < versions.length - 1 && (
            <Tooltip title="Compare with previous version">
              <Button
                size="small"
                icon={<DiffOutlined />}
                onClick={() => handleCompare(record, versions[index + 1])}
              >
                Compare
              </Button>
            </Tooltip>
          )}
          {index > 0 && (
            <Popconfirm
              title={`Roll back to ${record.version}?`}
              description="This will create a new version based on this one."
              onConfirm={() => handleRollback(record)}
            >
              <Button size="small" icon={<RollbackOutlined />} danger>
                Rollback
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const selectedFile = MOCK_FILES.find((f) => f.id === selectedFileId);

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} style={{ margin: 0 }}>Version History</Title>
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Space align="center">
            <Text strong>Select File:</Text>
            <Select
              style={{ width: 320 }}
              value={selectedFileId}
              onChange={setSelectedFileId}
              options={MOCK_FILES.map((f) => ({ label: f.name, value: f.id }))}
              placeholder="Choose a file to view versions"
            />
          </Space>
        </Card>

        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            selectedFile && (
              <Space>
                <HistoryOutlined />
                <Text>Version history for <Text strong>{selectedFile.name}</Text></Text>
                <Tag color="blue">{versions.length} versions</Tag>
              </Space>
            )
          }
        >
          <Alert
            message="AI-generated content is marked with a 🤖 badge. Rollback creates a new version preserving the full history."
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Table
            loading={loading}
            dataSource={versions}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </Card>

        {/* View Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              {viewModal?.version} — Content Preview
              {viewModal?.isAI && <Tag color="purple" icon={<RobotOutlined />}>AI Generated</Tag>}
            </Space>
          }
          open={!!viewModal}
          onCancel={() => setViewModal(null)}
          footer={[<Button key="close" onClick={() => setViewModal(null)}>Close</Button>]}
          width={640}
        >
          {viewModal && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary">
                  {viewModal.author} · {viewModal.timestamp} · {viewModal.size}
                </Text>
              </div>
              {viewModal.isAI && (
                <Alert
                  message="AI-generated content"
                  description="Parts of this version were generated or summarized by AI."
                  type="warning"
                  showIcon
                  icon={<RobotOutlined />}
                  style={{ marginBottom: 12 }}
                />
              )}
              <div
                style={{
                  background: '#f8f8f8',
                  borderRadius: 8,
                  padding: 16,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {viewModal.content}
              </div>
            </div>
          )}
        </Modal>

        {/* Compare Modal */}
        <Modal
          title={
            <Space>
              <DiffOutlined />
              Version Comparison
            </Space>
          }
          open={compareModal}
          onCancel={() => setCompareModal(false)}
          footer={[<Button key="close" onClick={() => setCompareModal(false)}>Close</Button>]}
          width={900}
        >
          {compareVersionA && compareVersionB && (
            <Row gutter={16}>
              <Col span={12}>
                <div
                  style={{
                    background: '#fff1f0',
                    border: '1px solid #ffa39e',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <Tag color="red">{compareVersionB.version}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{compareVersionB.timestamp}</Text>
                  </Space>
                </div>
                <div
                  style={{
                    background: '#f8f8f8',
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: 12,
                    lineHeight: 1.6,
                    maxHeight: 400,
                    overflowY: 'auto',
                  }}
                >
                  {compareVersionB.content}
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <Tag color="green">{compareVersionA.version}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{compareVersionA.timestamp}</Text>
                    <Tag color="blue">Newer</Tag>
                  </Space>
                </div>
                <div
                  style={{
                    background: '#f8f8f8',
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: 12,
                    lineHeight: 1.6,
                    maxHeight: 400,
                    overflowY: 'auto',
                  }}
                >
                  {compareVersionA.content}
                </div>
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

export default VersionHistoryPage;
