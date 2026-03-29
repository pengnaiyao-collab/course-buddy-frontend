import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Breadcrumb,
  DatePicker,
  Select,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  HomeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MOCK_LOGS = [
  {
    id: 1,
    timestamp: '2024-03-29 14:30:00',
    user: 'alice_wang',
    action: 'UPDATE',
    resource: 'Knowledge Item',
    resourceId: 123,
    details: 'Updated title from "BST" to "Binary Search Trees"',
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2024-03-29 14:25:00',
    user: 'bob_liu',
    action: 'CREATE',
    resource: 'Collaboration Project',
    resourceId: 456,
    details: 'Created project "Web Dev Team"',
    status: 'success',
  },
  {
    id: 3,
    timestamp: '2024-03-29 14:20:00',
    user: 'carol_zhang',
    action: 'DELETE',
    resource: 'Note',
    resourceId: 789,
    details: 'Deleted note "Study Notes"',
    status: 'success',
  },
];

function AuditLogsPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [actionFilter, setActionFilter] = useState(null);
  const [resourceFilter, setResourceFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // TODO: Call API to fetch audit logs
        setLogs(MOCK_LOGS);
      } catch {
        setLogs(MOCK_LOGS);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'green';
      case 'UPDATE':
        return 'blue';
      case 'DELETE':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 120,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Audit Logs' },
          ]}
        />

        <Title level={3} style={{ marginBottom: 24 }}>
          📋 Audit Logs
        </Title>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by action"
                allowClear
                value={actionFilter}
                onChange={setActionFilter}
                options={[
                  { value: 'CREATE', label: 'Create' },
                  { value: 'UPDATE', label: 'Update' },
                  { value: 'DELETE', label: 'Delete' },
                ]}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by resource"
                allowClear
                value={resourceFilter}
                onChange={setResourceFilter}
                options={[
                  { value: 'Note', label: 'Note' },
                  { value: 'Knowledge Item', label: 'Knowledge Item' },
                  { value: 'Course', label: 'Course' },
                  { value: 'Collaboration Project', label: 'Project' },
                ]}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by user"
                allowClear
                value={userFilter}
                onChange={setUserFilter}
                options={[
                  { value: 'alice_wang', label: 'Alice Wang' },
                  { value: 'bob_liu', label: 'Bob Liu' },
                  { value: 'carol_zhang', label: 'Carol Zhang' },
                ]}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Button icon={<ReloadOutlined />} onClick={() => setLogs(MOCK_LOGS)}>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : logs.length === 0 ? (
          <Empty description="No audit logs found" />
        ) : (
          <Table columns={columns} dataSource={logs} rowKey="id" pagination={{ pageSize: 20 }} />
        )}
      </div>
    </AppLayout>
  );
}

export default AuditLogsPage;
