import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Table,
  Space,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Tag,
} from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title } = Typography;

const MOCK_SHARES = [
  { id: 1, resourceName: 'Lecture1.pdf', shareLink: 'share/abc123', expiresAt: '2024-04-29', viewers: 12 },
  { id: 2, resourceName: 'Demo.zip', shareLink: 'share/def456', expiresAt: 'Never', viewers: 8 },
];

function FileSharingPage() {
  const [shares, setShares] = useState(MOCK_SHARES);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'Resource', dataIndex: 'resourceName', key: 'resourceName' },
    { title: 'Share Link', dataIndex: 'shareLink', key: 'shareLink' },
    { title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt' },
    { title: 'Viewers', dataIndex: 'viewers', key: 'viewers' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<CopyOutlined />} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb items={[{ href: '/', title: <HomeOutlined /> }, { title: 'File Sharing' }]} />
        <Title level={3} style={{ marginBottom: 24 }}>
          📤 File Sharing
        </Title>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Create Share Link
            </Button>
          </div>
          <Table columns={columns} dataSource={shares} pagination={false} />
        </Card>

        <Modal
          title="Create Share Link"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="resource" label="Resource" rules={[{ required: true }]}>
              <Input placeholder="Select file" />
            </Form.Item>
            <Form.Item name="expiresAt" label="Expires At">
              <Input type="date" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default FileSharingPage;
