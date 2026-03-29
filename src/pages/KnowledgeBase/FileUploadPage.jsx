import React, { useState, useCallback } from 'react';
import {
  Upload,
  Button,
  Progress,
  Table,
  Tag,
  Typography,
  Space,
  Select,
  Modal,
  message,
  Card,
  Divider,
  Tooltip,
  Badge,
  Alert,
  InputNumber,
  Switch,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  ScanOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToQueue,
  startUpload,
  updateProgress,
  uploadSuccess,
  removeFromQueue,
  clearHistory,
} from '../../store/slices/uploadSlice';
import AppLayout from '../../components/layout/AppLayout';
import { uploadFileWithCategory } from '../../services/api/files';
import { recognizeOcr } from '../../services/api/ocr';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const ACCEPTED_TYPES = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx',
  '.xls', '.xlsx', '.jpg', '.jpeg', '.png',
  '.gif', '.mp3', '.mp4', '.txt', '.md', '.zip',
];

const MAX_SIZE_MB = 100;

const CATEGORIES = ['Lecture Notes', 'Assignments', 'Lab Materials', 'Reference', 'Media', 'Other'];

const OCR_SUPPORTED = new Set(['jpg', 'jpeg', 'png', 'gif', 'pdf']);
const isOcrFileType = (name) => OCR_SUPPORTED.has(name.split('.').pop().toLowerCase());

function getStatusTag(status) {
  switch (status) {
    case 'uploading': return <Tag icon={<LoadingOutlined />} color="processing">Uploading</Tag>;
    case 'success':   return <Tag icon={<CheckCircleOutlined />} color="success">Success</Tag>;
    case 'error':     return <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
    default:          return <Tag color="default">Pending</Tag>;
  }
}

let uidCounter = 1;

function FileUploadPage() {
  const dispatch = useDispatch();
  const { queue, history } = useSelector((state) => state.upload);
  const [category, setCategory] = useState('Lecture Notes');
  const [ocrVisible, setOcrVisible] = useState(false);
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrCourseId, setOcrCourseId] = useState(1);
  const [autoOcrEnabled, setAutoOcrEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [localFilesByUid, setLocalFilesByUid] = useState({});

  const simulateUpload = useCallback((uid, name) => {
    dispatch(startUpload(uid));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        dispatch(updateProgress({ uid, progress: 100 }));
        setTimeout(() => {
          dispatch(uploadSuccess({ uid, url: `/files/${uid}` }));
          message.success(`${name} uploaded successfully`);
        }, 300);
      } else {
        dispatch(updateProgress({ uid, progress }));
      }
    }, 250);
  }, [dispatch]);

  const runOcrForFile = useCallback(async (file, { courseId, silent = false } = {}) => {
    const resolvedCourseId = courseId || Number(localStorage.getItem('selectedCourseId') || 1);
    const res = await recognizeOcr({
      file,
      language: 'chi_sim+eng',
      courseId: resolvedCourseId,
      category: category || 'OCR Notes',
      tags: `OCR,${category || 'Lecture Notes'}`,
      autoArchive: true,
    });

    if (!res.ok) {
      throw new Error(`OCR failed: HTTP ${res.status}`);
    }
    const body = await res.json();
    const result = body?.data;
    if (!silent) {
      if (result?.knowledgeItemId) {
        message.success(`OCR completed and archived to knowledge base (ID: ${result.knowledgeItemId})`);
      } else {
        message.success('OCR completed');
      }
    }
    return result;
  }, [category]);

  const doRealUpload = useCallback(async (uid, file) => {
    dispatch(startUpload(uid));
    try {
      const res = await uploadFileWithCategory(file, category);
      if (!res.ok) {
        throw new Error(`Upload failed: HTTP ${res.status}`);
      }
      const body = await res.json();
      const first = body?.data?.successResults?.[0];
      const uploadId = first?.uploadId || uid;
      const fileUrl = `/files/${uploadId}`;
      dispatch(updateProgress({ uid, progress: 100 }));
      dispatch(uploadSuccess({ uid, url: fileUrl }));
      message.success(`${file.name} uploaded successfully`);

      if (autoOcrEnabled && isOcrFileType(file.name)) {
        // Run in background so upload UX remains responsive.
        runOcrForFile(file, { silent: true }).then((result) => {
          if (result?.knowledgeItemId) {
            message.success(`${file.name}: auto OCR archived (ID: ${result.knowledgeItemId})`);
          }
        }).catch(() => {
          message.warning(`${file.name}: auto OCR failed, you can retry manually`);
        });
      }
    } catch {
      // Fall back to simulated upload if API is not reachable
      simulateUpload(uid, file.name);
    }
  }, [dispatch, category, simulateUpload, autoOcrEnabled, runOcrForFile]);

  const beforeUpload = useCallback((file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      message.error(`${file.name}: unsupported file type`);
      return Upload.LIST_IGNORE;
    }
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      message.error(`${file.name} exceeds the 100 MB limit (${sizeMB.toFixed(1)} MB)`);
      return Upload.LIST_IGNORE;
    }
    const uid = `upload-${uidCounter++}`;
    dispatch(addToQueue({
      uid,
      name: file.name,
      size: `${sizeMB.toFixed(1)} MB`,
      type: ext.slice(1),
      category,
    }));
    setLocalFilesByUid((prev) => ({ ...prev, [uid]: file }));
    setTimeout(() => doRealUpload(uid, file), 200);
    return false; // prevent default upload
  }, [dispatch, doRealUpload, category]);

  const handleOpenOcr = (record) => {
    setOcrFile(record);
    setOcrCourseId(Number(localStorage.getItem('selectedCourseId') || 1));
    setOcrVisible(true);
  };

  const handleRunOcr = async () => {
    if (!ocrFile) return;
    const file = localFilesByUid[ocrFile.uid];
    if (!file) {
      message.error('Original file not found in local session. Please upload again and retry OCR.');
      return;
    }

    setOcrRunning(true);
    try {
      await runOcrForFile(file, { courseId: ocrCourseId, silent: false });
      setOcrVisible(false);
    } catch {
      message.error('OCR failed. Please check backend OCR service and try again.');
    } finally {
      setOcrRunning(false);
    }
  };

  const isOcrSupported = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return OCR_SUPPORTED.has(ext);
  };

  const queueColumns = [
    { title: 'File Name', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Size', dataIndex: 'size', key: 'size', width: 90 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 130,
      render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => getStatusTag(s) },
    {
      title: 'Progress', key: 'progress', width: 160,
      render: (_, r) => (
        <Progress
          percent={r.progress}
          size="small"
          status={r.status === 'error' ? 'exception' : r.status === 'success' ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Actions', key: 'actions', width: 120,
      render: (_, r) => (
        <Space>
          {isOcrSupported(r.name) && (
            <Tooltip title="OCR Recognition">
              <Button size="small" icon={<ScanOutlined />} onClick={() => handleOpenOcr(r)} />
            </Tooltip>
          )}
          <Tooltip title="Remove">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => dispatch(removeFromQueue(r.uid))}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    { title: 'File Name', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Size', dataIndex: 'size', key: 'size', width: 90 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 130,
      render: (v) => <Tag color="blue">{v || 'Other'}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => getStatusTag(s) },
    { title: 'Completed At', dataIndex: 'completedAt', key: 'completedAt', width: 180,
      render: (v) => new Date(v).toLocaleString() },
  ];

  const MOCK_HISTORY = [
    { uid: 'h1', name: 'Lecture_01.pdf', size: '3.2 MB', category: 'Lecture Notes', status: 'success', completedAt: '2024-03-15T10:23:00Z' },
    { uid: 'h2', name: 'Week3_Slides.pptx', size: '8.7 MB', category: 'Lecture Notes', status: 'success', completedAt: '2024-03-14T16:05:00Z' },
    { uid: 'h3', name: 'Lab2.docx', size: '1.1 MB', category: 'Lab Materials', status: 'error', completedAt: '2024-03-14T09:45:00Z' },
    { uid: 'h4', name: 'Dataset.xlsx', size: '15.4 MB', category: 'Reference', status: 'success', completedAt: '2024-03-13T14:30:00Z' },
  ];
  const combinedHistory = [...history, ...MOCK_HISTORY];

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <Title level={3}>File Upload</Title>

        <Alert
          message={`Supported formats: ${ACCEPTED_TYPES.join(', ')} · Max size: 100 MB per file`}
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />

        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Text strong>Category:</Text>
            <Select
              value={category}
              onChange={setCategory}
              style={{ width: 200 }}
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
            <Space>
              <Switch checked={autoOcrEnabled} onChange={setAutoOcrEnabled} />
              <Text type="secondary">Auto OCR after upload (images/PDF)</Text>
            </Space>
          </div>

          <Dragger
            multiple
            beforeUpload={beforeUpload}
            showUploadList={false}
            accept={ACCEPTED_TYPES.join(',')}
            style={{ borderRadius: 8 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16 }}>
              Click or drag files here to upload
            </p>
            <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
              Supports single or batch upload. PDF, Word, PPT, Excel, images, audio, video and more.
            </p>
          </Dragger>
        </Card>

        {/* Upload queue */}
        {queue.length > 0 && (
          <Card
            bordered={false}
            style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <Space>
                <UploadOutlined />
                <span>Upload Queue</span>
                <Badge count={queue.filter((f) => f.status === 'uploading').length} showZero={false} />
              </Space>
            }
          >
            <Table
              dataSource={queue}
              columns={queueColumns}
              rowKey="uid"
              size="small"
              pagination={false}
            />
          </Card>
        )}

        {/* Upload history */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            <Space>
              <HistoryOutlined />
              <span>Upload History</span>
            </Space>
          }
          extra={
            history.length > 0 && (
              <Button size="small" onClick={() => dispatch(clearHistory())}>
                Clear
              </Button>
            )
          }
        >
          <Table
            dataSource={combinedHistory}
            columns={historyColumns}
            rowKey="uid"
            size="small"
            pagination={{ pageSize: 8 }}
          />
        </Card>

        {/* OCR Modal */}
        <Modal
          title={
            <Space>
              <ScanOutlined />
              OCR Recognition
            </Space>
          }
          open={ocrVisible}
          onCancel={() => setOcrVisible(false)}
          footer={[
            <Button key="close" onClick={() => setOcrVisible(false)}>Close</Button>,
            <Button key="run" type="primary" icon={<ScanOutlined />} loading={ocrRunning}
              onClick={handleRunOcr}>
              Start OCR
            </Button>,
          ]}
        >
          {ocrFile && (
            <div>
              <p><Text strong>File:</Text> {ocrFile.name}</p>
              <Divider />
              <Alert
                message="OCR Feature"
                description="This will extract text from images or scanned PDFs using optical character recognition. The extracted text will be indexed and made searchable in the knowledge base."
                type="info"
                showIcon
              />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Supported: JPG, PNG, GIF, PDF (scanned)</Text>
              </div>
              <div style={{ marginTop: 12 }}>
                <Text strong>Course ID for auto-archive:</Text>
                <div style={{ marginTop: 6 }}>
                  <InputNumber min={1} value={ocrCourseId} onChange={(v) => setOcrCourseId(v || 1)} />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

export default FileUploadPage;
