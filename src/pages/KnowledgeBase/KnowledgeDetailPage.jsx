import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Breadcrumb,
  Tag,
  Button,
  Space,
  Divider,
  Tabs,
  List,
  Avatar,
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Rate,
  Row,
  Col,
} from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  LinkOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const SAMPLE_KNOWLEDGE_POINT = {
  id: 1,
  title: 'Binary Search Trees',
  category: 'Data Structures',
  level: 'Intermediate',
  tags: ['BST', 'Trees', 'Algorithms'],
  description: 'Binary Search Trees (BST) are a special type of binary tree where each node has at most two children, and for any node, all values in the left subtree are less than the node value, and all values in the right subtree are greater.',
  content: `
## Definition
A Binary Search Tree is a binary tree where:
- For each node, all values in its left subtree are strictly less than the node's value
- All values in its right subtree are strictly greater than the node's value

## Properties
- Average time complexity: O(log n) for search, insert, delete
- Worst case: O(n) when tree becomes skewed
- Can be self-balancing (AVL, Red-Black trees)

## Common Operations
1. **Search**: Compare with current node and go left or right
2. **Insert**: Find position and insert new node
3. **Delete**: Handle three cases (no child, one child, two children)
4. **Traversal**: InOrder, PreOrder, PostOrder

## Applications
- Database indexing
- File systems
- Expression parsing
- Priority queues
  `,
  resources: [
    { id: 1, type: 'video', title: 'BST Basics (YouTube)', url: '#', author: 'Prof. Chen' },
    { id: 2, type: 'pdf', title: 'BST Implementation Guide', url: '#', author: 'Course Material' },
    { id: 3, type: 'code', title: 'BST Code Example (GitHub)', url: '#', author: 'Instructor' },
  ],
  relatedKnowledge: [
    { id: 2, title: 'AVL Trees', category: 'Data Structures', level: 'Advanced' },
    { id: 3, title: 'Hash Tables', category: 'Data Structures', level: 'Intermediate' },
    { id: 4, title: 'Tree Traversal', category: 'Algorithms', level: 'Intermediate' },
  ],
  userNotes: [
    { id: 1, author: 'Alice Wang', content: 'Great explanation of BST insertion!', createdAt: '2024-03-20' },
    { id: 2, author: 'Bob Liu', content: 'Could use more examples on deletion', createdAt: '2024-03-19' },
  ],
  discussion: [
    { id: 1, author: 'Alice Wang', avatar: 'A', content: 'How does balancing affect performance?', createdAt: '2024-03-20', likes: 5 },
    { id: 2, author: 'Bob Liu', avatar: 'B', content: 'Great question! Self-balancing trees maintain height close to log(n)', createdAt: '2024-03-20', likes: 8 },
  ],
  stats: {
    views: 1234,
    learningNotes: 42,
    discussions: 18,
    rating: 4.5,
  },
};

function KnowledgeDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [knowledgePoint, setKnowledgePoint] = useState(SAMPLE_KNOWLEDGE_POINT);
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [noteForm] = Form.useForm();
  const [discussionForm] = Form.useForm();
  const [userNotes, setUserNotes] = useState(SAMPLE_KNOWLEDGE_POINT.userNotes);
  const [discussions, setDiscussions] = useState(SAMPLE_KNOWLEDGE_POINT.discussion);

  const fetchKnowledgePoint = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Call API to fetch knowledge point details
      // const res = await getKnowledgePointDetail(id);
      // setKnowledgePoint(res.data);
      setKnowledgePoint(SAMPLE_KNOWLEDGE_POINT);
    } catch (err) {
      console.error('Failed to fetch knowledge point:', err);
      message.error('Failed to load knowledge point');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKnowledgePoint();
  }, [fetchKnowledgePoint]);

  const handleAddNote = async (values) => {
    const newNote = {
      id: Date.now(),
      author: user?.username || 'You',
      content: values.note,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      // TODO: Call API to save note
      setUserNotes((prev) => [newNote, ...prev]);
      message.success('Note added successfully');
    } catch {
      setUserNotes((prev) => [newNote, ...prev]);
      message.success('Note added (offline)');
    }
    setNoteModalOpen(false);
    noteForm.resetFields();
  };

  const handleAddDiscussion = async (values) => {
    const newDiscussion = {
      id: Date.now(),
      author: user?.username || 'You',
      avatar: (user?.username || 'U')[0].toUpperCase(),
      content: values.discussion,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    try {
      // TODO: Call API to save discussion
      setDiscussions((prev) => [newDiscussion, ...prev]);
      message.success('Discussion posted successfully');
    } catch {
      setDiscussions((prev) => [newDiscussion, ...prev]);
      message.success('Discussion posted (offline)');
    }
    setDiscussionModalOpen(false);
    discussionForm.resetFields();
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/knowledge', title: 'Knowledge Base' },
            { title: knowledgePoint.title },
          ]}
        />

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col flex="auto">
              <Title level={2} style={{ marginBottom: 8 }}>
                <BookOutlined /> {knowledgePoint.title}
              </Title>
              <div style={{ marginBottom: 12 }}>
                <Tag color="blue">{knowledgePoint.category}</Tag>
                <Tag color={knowledgePoint.level === 'Beginner' ? 'green' : knowledgePoint.level === 'Intermediate' ? 'orange' : 'red'}>
                  {knowledgePoint.level}
                </Tag>
                {knowledgePoint.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <Space size="large">
                <Text type="secondary">
                  👁️ {knowledgePoint.stats.views} views
                </Text>
                <Text type="secondary">
                  📝 {knowledgePoint.stats.learningNotes} notes
                </Text>
                <Text type="secondary">
                  💬 {knowledgePoint.stats.discussions} discussions
                </Text>
                <Rate disabled defaultValue={knowledgePoint.stats.rating} />
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  type={favorited ? 'primary' : 'default'}
                  icon={favorited ? <StarFilled /> : <StarOutlined />}
                  onClick={() => setFavorited(!favorited)}
                >
                  {favorited ? 'Favorited' : 'Favorite'}
                </Button>
                <Button icon={<ShareAltOutlined />}>Share</Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: '📖 Overview',
              children: (
                <Card bordered={false}>
                  <Title level={4}>Description</Title>
                  <Paragraph>{knowledgePoint.description}</Paragraph>

                  <Divider />

                  <Title level={4}>Content</Title>
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {knowledgePoint.content}
                  </Paragraph>
                </Card>
              ),
            },
            {
              key: 'resources',
              label: `📚 Resources (${knowledgePoint.resources.length})`,
              children: (
                <Card bordered={false}>
                  <List
                    dataSource={knowledgePoint.resources}
                    renderItem={(resource) => (
                      <List.Item
                        actions={[
                          <Button type="link" icon={<LinkOutlined />}>
                            Open
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <span style={{ fontSize: 18 }}>
                              {resource.type === 'video' ? '🎬' : resource.type === 'pdf' ? '📄' : '💻'}
                            </span>
                          }
                          title={resource.title}
                          description={`by ${resource.author}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              ),
            },
            {
              key: 'related',
              label: `🔗 Related Knowledge (${knowledgePoint.relatedKnowledge.length})`,
              children: (
                <Card bordered={false}>
                  {knowledgePoint.relatedKnowledge.length === 0 ? (
                    <Empty />
                  ) : (
                    <List
                      dataSource={knowledgePoint.relatedKnowledge}
                      renderItem={(related) => (
                        <List.Item
                          actions={[
                            <Button type="link">View</Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={related.title}
                            description={
                              <>
                                <Tag color="blue">{related.category}</Tag>
                                <Tag color={related.level === 'Beginner' ? 'green' : related.level === 'Intermediate' ? 'orange' : 'red'}>
                                  {related.level}
                                </Tag>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              ),
            },
            {
              key: 'notes',
              label: `📝 Learning Notes (${userNotes.length})`,
              children: (
                <Card
                  bordered={false}
                  extra={
                    <Button type="primary" onClick={() => setNoteModalOpen(true)}>
                      Add Note
                    </Button>
                  }
                >
                  {userNotes.length === 0 ? (
                    <Empty description="No learning notes yet" />
                  ) : (
                    <List
                      dataSource={userNotes}
                      renderItem={(note) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar>{note.author[0]}</Avatar>}
                            title={note.author}
                            description={
                              <>
                                <div>{note.content}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {note.createdAt}
                                </Text>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              ),
            },
            {
              key: 'discussion',
              label: `💬 Discussion (${discussions.length})`,
              children: (
                <Card
                  bordered={false}
                  extra={
                    <Button type="primary" onClick={() => setDiscussionModalOpen(true)}>
                      Post Discussion
                    </Button>
                  }
                >
                  {discussions.length === 0 ? (
                    <Empty description="No discussions yet" />
                  ) : (
                    <List
                      dataSource={discussions}
                      renderItem={(discussion) => (
                        <List.Item
                          actions={[
                            <Button type="text" size="small">
                              👍 {discussion.likes}
                            </Button>,
                            <Button type="text" size="small">
                              💬 Reply
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar>{discussion.avatar}</Avatar>}
                            title={discussion.author}
                            description={
                              <>
                                <div>{discussion.content}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {discussion.createdAt}
                                </Text>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              ),
            },
          ]}
        />

        {/* Add Note Modal */}
        <Modal
          title="Add Learning Note"
          open={noteModalOpen}
          onCancel={() => {
            setNoteModalOpen(false);
            noteForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setNoteModalOpen(false);
              noteForm.resetFields();
            }}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => noteForm.submit()}>
              Post Note
            </Button>,
          ]}
        >
          <Form form={noteForm} layout="vertical" onFinish={handleAddNote}>
            <Form.Item name="note" label="Your Note" rules={[{ required: true, message: 'Please enter your note' }]}>
              <TextArea rows={5} placeholder="Write your learning note..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* Discussion Modal */}
        <Modal
          title="Post Discussion"
          open={discussionModalOpen}
          onCancel={() => {
            setDiscussionModalOpen(false);
            discussionForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setDiscussionModalOpen(false);
              discussionForm.resetFields();
            }}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => discussionForm.submit()}>
              Post Discussion
            </Button>,
          ]}
        >
          <Form form={discussionForm} layout="vertical" onFinish={handleAddDiscussion}>
            <Form.Item name="discussion" label="Discussion Topic" rules={[{ required: true, message: 'Please enter your discussion' }]}>
              <TextArea rows={5} placeholder="Share your thoughts or questions..." />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default KnowledgeDetailPage;
