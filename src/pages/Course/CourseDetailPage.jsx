import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Tabs,
  List,
  Avatar,
  Table,
  Tag,
  Space,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Form,
  Input,
  Modal,
} from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  PlusOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;
const { TextArea } = Input;

function CourseDetailPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [resources] = useState([
    { id: 1, title: 'Lecture 1.pdf', type: 'pdf', downloads: 45 },
    { id: 2, title: 'Demo Code.zip', type: 'code', downloads: 32 },
  ]);
  const [discussions] = useState([
    { id: 1, author: 'alice_wang', content: 'Great course!', likes: 5, date: '2024-03-28' },
  ]);

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Course Details' }]} />

        <Card style={{ marginBottom: 24 }}>
          <Title level={2}>📚 Data Structures & Algorithms</Title>
          <Text type="secondary">By Prof. Chen • 156 students • ⭐ 4.8 (82 ratings)</Text>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Progress" value={65} suffix="%" /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Hours" value={24} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Resources" value={resources.length} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="Discussions" value={discussions.length} /></Card>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <Card>
                  <Text>Comprehensive course on data structures and algorithms with practical examples.</Text>
                </Card>
              ),
            },
            {
              key: 'resources',
              label: `Resources (${resources.length})`,
              children: (
                <Card>
                  <List
                    dataSource={resources}
                    renderItem={(r) => (
                      <List.Item actions={[<Button type="link" size="small">Download</Button>]}>
                        <Text>{r.title}</Text>
                        <Text type="secondary" style={{ marginLeft: 12 }}>
                          {r.downloads} downloads
                        </Text>
                      </List.Item>
                    )}
                  />
                </Card>
              ),
            },
            {
              key: 'discussions',
              label: `Discussions (${discussions.length})`,
              children: (
                <Card>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
                    Post Discussion
                  </Button>
                  <List
                    dataSource={discussions}
                    renderItem={(d) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={BookOutlined} />}
                          title={d.author}
                          description={
                            <div>
                              {d.content}
                              <br />
                              <Tag style={{ marginTop: 8 }}>
                                <LikeOutlined /> {d.likes}
                              </Tag>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              ),
            },
          ]}
        />

        <Modal title="Post Discussion" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="content" label="Content" rules={[{ required: true }]}>
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default CourseDetailPage;
