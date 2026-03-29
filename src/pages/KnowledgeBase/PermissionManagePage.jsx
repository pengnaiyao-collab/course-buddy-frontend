import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RotateRightOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import {
  approveReview,
  listMembers,
  listPendingReviews,
  removeMember,
  rejectReview,
  removeReview,
  rotateAdmin,
  submitReview,
  takedownReview,
  updateMemberPermission,
  getPermissionMatrix,
  updatePermissionMatrix,
  voteAdmin,
} from '../../services/api/permissions';

const { Title, Text } = Typography;

const ROLE_CONFIG = {
  L1: { label: 'Course Admin', color: 'red' },
  L2: { label: 'Core Collaborator', color: 'orange' },
  L3: { label: 'Enrolled Member', color: 'blue' },
  L4: { label: 'Campus Visitor', color: 'default' },
};

const ACTION_LEVEL_KEYS = ['l1', 'l2', 'l3', 'l4'];
const LEVEL_LABELS = ['L1', 'L2', 'L3', 'L4'];

function PermissionManagePage() {
  const courseId = Number(localStorage.getItem('selectedCourseId') || 1);
  const myUserId = Number(localStorage.getItem('userId') || 1);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [voteOpen, setVoteOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [voteForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes, rRes] = await Promise.all([
        listMembers(courseId),
        getPermissionMatrix(courseId),
        listPendingReviews({ size: 100 }),
      ]);
      setMembers(mRes.data || []);
      setMatrix(pRes.data || []);
      setReviews(rRes.data?.content || rRes.data || []);
    } catch (e) {
      console.error(e);
      message.error('Failed to load permission governance data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const candidateOptions = useMemo(
    () => members.filter((m) => m.permissionLevel !== 'L1')
      .map((m) => ({ label: `User#${m.userId} (${m.permissionLevel})`, value: m.userId })),
    [members]
  );

  const handleRoleChange = async (record, newRole) => {
    try {
      await updateMemberPermission(courseId, record.userId, newRole);
      message.success('Role updated');
      fetchAll();
    } catch {
      message.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (record) => {
    try {
      await removeMember(courseId, record.userId);
      message.success('Member removed');
      fetchAll();
    } catch {
      message.error('Failed to remove member');
    }
  };

  const toggleMatrix = async (actionKey, level, checked) => {
    try {
      await updatePermissionMatrix({
        courseId,
        actionKey,
        permissionLevel: level,
        allowed: checked,
      });
      setMatrix((prev) => prev.map((row) => (
        row.actionKey === actionKey ? { ...row, [level.toLowerCase()]: checked } : row
      )));
      message.success('Permission matrix updated');
    } catch {
      message.error('Update failed');
    }
  };

  const handleVote = async (values, mode = 'vote') => {
    const api = mode === 'rotate' ? rotateAdmin : voteAdmin;
    try {
      const res = await api(courseId, values.candidateUserId);
      const info = res.data;
      if (info.promotedToAdmin) {
        message.success('Candidate promoted to L1');
      } else {
        message.info(`Vote recorded (${info.votes}/${info.threshold})`);
      }
      setVoteOpen(false);
      voteForm.resetFields();
      fetchAll();
    } catch {
      message.error(mode === 'rotate' ? 'Rotate failed' : 'Vote failed');
    }
  };

  const handleSubmitReview = async (values) => {
    try {
      await submitReview({
        contentType: values.contentType,
        contentId: values.contentId,
        reviewerId: values.reviewerId,
        requiredApprovals: values.requiredApprovals || 2,
        comments: values.comments,
      });
      message.success('Review submitted');
      setReviewOpen(false);
      reviewForm.resetFields();
      fetchAll();
    } catch {
      message.error('Submit review failed');
    }
  };

  const handleReviewAction = async (action, review) => {
    try {
      if (action === 'approve') await approveReview(review.id, myUserId, 'Approved');
      if (action === 'reject') await rejectReview(review.id, myUserId, 'Rejected');
      if (action === 'takedown') await takedownReview(review.id, myUserId, 'Violation - takedown');
      if (action === 'remove') await removeReview(review.id, myUserId, 'Violation - remove');
      message.success('Review action completed');
      fetchAll();
    } catch {
      message.error('Review action failed');
    }
  };

  const memberColumns = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId', width: 100 },
    { title: 'Role', dataIndex: 'permissionLevel', key: 'permissionLevel', width: 220, render: (role, record) => (
      <Select
        value={role}
        onChange={(v) => handleRoleChange(record, v)}
        style={{ width: 180 }}
        options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({
          value: k,
          label: <Space><Tag color={v.color}>{k}</Tag>{v.label}</Space>,
        }))}
      />
    )},
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <Popconfirm title="Remove this member?" onConfirm={() => handleRemoveMember(record)}>
        <Button danger size="small">Remove</Button>
      </Popconfirm>
    )},
  ];

  const matrixColumns = [
    { title: 'Action', dataIndex: 'actionName', key: 'actionName' },
    ...LEVEL_LABELS.map((lv, idx) => ({
      title: <Tag color={ROLE_CONFIG[lv].color}>{lv}</Tag>,
      key: lv,
      dataIndex: ACTION_LEVEL_KEYS[idx],
      align: 'center',
      render: (val, row) => (
        <Button
          type={val ? 'primary' : 'default'}
          size="small"
          onClick={() => toggleMatrix(row.actionKey, lv, !val)}
          icon={val ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {val ? 'Allow' : 'Deny'}
        </Button>
      ),
    })),
  ];

  const reviewColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Content', key: 'content', render: (_, r) => `${r.contentType}#${r.contentId}` },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 130 },
    { title: 'Approvals', key: 'approvals', width: 120, render: (_, r) => `${r.approvalCount}/${r.requiredApprovals}` },
    { title: 'Moderation', dataIndex: 'moderationStatus', key: 'moderationStatus', width: 140 },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space wrap>
        <Button size="small" onClick={() => handleReviewAction('approve', r)}>Approve</Button>
        <Button size="small" onClick={() => handleReviewAction('reject', r)}>Reject</Button>
        <Button size="small" danger onClick={() => handleReviewAction('takedown', r)}>Takedown</Button>
        <Button size="small" danger type="primary" onClick={() => handleReviewAction('remove', r)}>Remove</Button>
      </Space>
    )},
  ];

  const tabItems = [
    {
      key: 'members',
      label: <Space><TeamOutlined />Members & Roles</Space>,
      children: <Table rowKey="id" loading={loading} dataSource={members} columns={memberColumns} pagination={false} />,
    },
    {
      key: 'matrix',
      label: <Space><SafetyOutlined />Action Matrix</Space>,
      children: (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Fine-grained governance permissions: view / upload / edit / export / review / takedown / delete / member management."
          />
          <Table rowKey="actionKey" loading={loading} dataSource={matrix} columns={matrixColumns} pagination={false} />
        </>
      ),
    },
    {
      key: 'election',
      label: <Space><UserSwitchOutlined />Admin Election & Rotation</Space>,
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">Students can vote for candidates. Current admin can also rotate directly.</Text>
          <Space>
            <Button type="primary" onClick={() => { voteForm.setFieldsValue({ mode: 'vote' }); setVoteOpen(true); }}>
              Vote Candidate
            </Button>
            <Button icon={<RotateRightOutlined />} onClick={() => { voteForm.setFieldsValue({ mode: 'rotate' }); setVoteOpen(true); }}>
              Rotate Admin
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      key: 'review',
      label: <Space><AuditOutlined />Double Review & Violations</Space>,
      children: (
        <>
          <div className="flex items-center justify-between mb-3">
            <Text type="secondary">Student uploads can require dual approval before publish.</Text>
            <Button type="primary" onClick={() => setReviewOpen(true)}>Submit Review</Button>
          </div>
          <Table rowKey="id" loading={loading} dataSource={reviews} columns={reviewColumns} pagination={{ pageSize: 8 }} />
        </>
      ),
    },
  ];

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} style={{ margin: 0 }}>Permission Governance</Title>
          <Tag color="blue">Course {courseId}</Tag>
        </div>
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Tabs items={tabItems} />
        </Card>
      </div>

      <Modal
        open={voteOpen}
        title="Admin Election / Rotation"
        onCancel={() => setVoteOpen(false)}
        onOk={() => voteForm.submit()}
      >
        <Form form={voteForm} layout="vertical" onFinish={(v) => handleVote(v, v.mode)}>
          <Form.Item name="mode" label="Mode" initialValue="vote">
            <Select options={[
              { value: 'vote', label: 'Vote Candidate' },
              { value: 'rotate', label: 'Rotate Admin' },
            ]} />
          </Form.Item>
          <Form.Item name="candidateUserId" label="Candidate" rules={[{ required: true }]}>
            <Select options={candidateOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={reviewOpen}
        title="Submit Review Task"
        onCancel={() => setReviewOpen(false)}
        onOk={() => reviewForm.submit()}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleSubmitReview}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="contentType" label="Content Type" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'KNOWLEDGE_ITEM', label: 'KNOWLEDGE_ITEM' },
                  { value: 'FILE_UPLOAD', label: 'FILE_UPLOAD' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contentId" label="Content ID" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="reviewerId" label="Primary Reviewer ID" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="requiredApprovals" label="Required Approvals" initialValue={2}>
                <InputNumber min={1} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="comments" label="Comments">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
}

export default PermissionManagePage;
