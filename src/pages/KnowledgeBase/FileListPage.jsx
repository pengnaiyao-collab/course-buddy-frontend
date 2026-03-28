import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Modal,
  Tooltip,
  Popconfirm,
  message,
  Dropdown,
  Row,
  Col,
  Avatar,
  Pagination,
  Badge,
  Segmented,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ShareAltOutlined,
  TableOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;
const { Search } = Input;

const FILE_ICON_MAP = {
  pdf:  { icon: <FilePdfOutlined />, color: '#ff4d4f' },
  doc:  { icon: <FileWordOutlined />, color: '#1677ff' },
  docx: { icon: <FileWordOutlined />, color: '#1677ff' },
  xls:  { icon: <FileExcelOutlined />, color: '#52c41a' },
  xlsx: { icon: <FileExcelOutlined />, color: '#52c41a' },
  ppt:  { icon: <FilePptOutlined />, color: '#fa8c16' },
  pptx: { icon: <FilePptOutlined />, color: '#fa8c16' },
  jpg:  { icon: <FileImageOutlined />, color: '#722ed1' },
  jpeg: { icon: <FileImageOutlined />, color: '#722ed1' },
  png:  { icon: <FileImageOutlined />, color: '#722ed1' },
  gif:  { icon: <FileImageOutlined />, color: '#722ed1' },
};

const getFileInfo = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICON_MAP[ext] || { icon: <FileOutlined />, color: '#8c8c8c' };
};

const TYPE_COLORS = {
  pdf: 'red', doc: 'blue', docx: 'blue', xls: 'green', xlsx: 'green',
  ppt: 'orange', pptx: 'orange', jpg: 'purple', jpeg: 'purple',
  png: 'purple', gif: 'purple', zip: 'default', md: 'cyan', txt: 'default',
};

const MOCK_FILES = [
  { id: 1, name: 'Lecture_01_Introduction.pdf', type: 'pdf', size: '3.2 MB', sizeBytes: 3355443, uploader: 'Prof. Chen', uploadedAt: '2024-03-15', category: 'Lecture Notes', status: 'active' },
  { id: 2, name: 'Week3_Algorithms.pptx', type: 'pptx', size: '8.7 MB', sizeBytes: 9122611, uploader: 'Alice Wang', uploadedAt: '2024-03-14', category: 'Lecture Notes', status: 'active' },
  { id: 3, name: 'Lab2_DataStructures.docx', type: 'docx', size: '1.1 MB', sizeBytes: 1153433, uploader: 'Bob Liu', uploadedAt: '2024-03-14', category: 'Lab Materials', status: 'active' },
  { id: 4, name: 'Assignment3_Solution.pdf', type: 'pdf', size: '0.9 MB', sizeBytes: 943718, uploader: 'Carol Zhang', uploadedAt: '2024-03-13', category: 'Assignments', status: 'active' },
  { id: 5, name: 'Dataset_Training.xlsx', type: 'xlsx', size: '15.4 MB', sizeBytes: 16148070, uploader: 'Prof. Chen', uploadedAt: '2024-03-13', category: 'Reference', status: 'active' },
  { id: 6, name: 'Diagram_SystemArch.png', type: 'png', size: '2.3 MB', sizeBytes: 2411724, uploader: 'Alice Wang', uploadedAt: '2024-03-12', category: 'Reference', status: 'active' },
  { id: 7, name: 'Notes_Week4.md', type: 'md', size: '0.2 MB', sizeBytes: 204800, uploader: 'David Kim', uploadedAt: '2024-03-12', category: 'Lecture Notes', status: 'active' },
  { id: 8, name: 'Reference_Papers.zip', type: 'zip', size: '42.1 MB', sizeBytes: 44148531, uploader: 'Prof. Chen', uploadedAt: '2024-03-11', category: 'Reference', status: 'active' },
  { id: 9, name: 'Midterm_Review.pdf', type: 'pdf', size: '5.8 MB', sizeBytes: 6082330, uploader: 'Prof. Chen', uploadedAt: '2024-03-10', category: 'Assignments', status: 'active' },
  { id: 10, name: 'CodeSamples_Week5.zip', type: 'zip', size: '12.0 MB', sizeBytes: 12582912, uploader: 'Bob Liu', uploadedAt: '2024-03-09', category: 'Lab Materials', status: 'active' },
  { id: 11, name: 'Project_Spec.docx', type: 'docx', size: '0.7 MB', sizeBytes: 734003, uploader: 'Prof. Chen', uploadedAt: '2024-03-08', category: 'Assignments', status: 'active' },
  { id: 12, name: 'Week1_Intro.pptx', type: 'pptx', size: '6.3 MB', sizeBytes: 6606028, uploader: 'Prof. Chen', uploadedAt: '2024-03-07', category: 'Lecture Notes', status: 'active' },
];

function FileListPage() {
  const [viewMode, setViewMode] = useState('table');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [files, setFiles] = useState(MOCK_FILES);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const filtered = files
    .filter((f) => {
      if (searchText && !f.name.toLowerCase().includes(searchText.toLowerCase()) &&
          !f.uploader.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (filterType && f.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    message.success('File deleted');
  };

  const handleBulkDelete = () => {
    setFiles((prev) => prev.filter((f) => !selectedRowKeys.includes(f.id)));
    message.success(`${selectedRowKeys.length} file(s) deleted`);
    setSelectedRowKeys([]);
  };

  const getContextMenu = (record) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'View', onClick: () => setPreviewFile(record) },
      { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
      { key: 'share', icon: <ShareAltOutlined />, label: 'Share' },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true,
        onClick: () => handleDelete(record.id) },
    ],
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => {
        const { icon, color } = getFileInfo(name);
        return (
          <Space>
            <span style={{ color, fontSize: 18 }}>{icon}</span>
            <Text ellipsis style={{ maxWidth: 260 }}>{name}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (t) => <Tag color={TYPE_COLORS[t] || 'default'}>{t.toUpperCase()}</Tag>,
    },
    { title: 'Size', dataIndex: 'size', key: 'size', width: 90 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 130,
      render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Uploader', dataIndex: 'uploader', key: 'uploader', width: 130 },
    { title: 'Date', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 110 },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setPreviewFile(record)} />
          </Tooltip>
          <Dropdown menu={getContextMenu(record)} trigger={['click']}>
            <Button size="small">···</Button>
          </Dropdown>
          <Popconfirm title="Delete this file?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} style={{ margin: 0 }}>File List</Title>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => message.info('Export started')}>
            Export Selected
          </Button>
        </div>

        {/* Toolbar */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Search by filename or uploader…"
                allowClear
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="File type"
                allowClear
                style={{ width: '100%' }}
                value={filterType}
                onChange={(v) => { setFilterType(v); setPage(1); }}
                options={['pdf','docx','pptx','xlsx','png','zip','md'].map((t) => ({ label: t.toUpperCase(), value: t }))}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                style={{ width: '100%' }}
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'Sort by Date', value: 'date' },
                  { label: 'Sort by Name', value: 'name' },
                  { label: 'Sort by Size', value: 'size' },
                ]}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'table', icon: <TableOutlined /> },
                  { value: 'card', icon: <AppstoreOutlined /> },
                ]}
              />
            </Col>
            <Col xs={12} sm={4}>
              {selectedRowKeys.length > 0 && (
                <Popconfirm title={`Delete ${selectedRowKeys.length} files?`} onConfirm={handleBulkDelete}>
                  <Button danger icon={<DeleteOutlined />}>
                    Delete ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </Col>
          </Row>
        </Card>

        {viewMode === 'table' ? (
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Table
              loading={loading}
              dataSource={filtered}
              columns={columns}
              rowKey="id"
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false }}
              size="middle"
              onRow={(record) => ({
                onContextMenu: (e) => {
                  e.preventDefault();
                },
              })}
            />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paged.map((file) => {
                const { icon, color } = getFileInfo(file.name);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={file.id}>
                    <Card
                      hoverable
                      bordered={false}
                      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                      actions={[
                        <EyeOutlined key="view" onClick={() => setPreviewFile(file)} />,
                        <EditOutlined key="edit" />,
                        <Popconfirm title="Delete?" onConfirm={() => handleDelete(file.id)} key="del">
                          <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        </Popconfirm>,
                      ]}
                    >
                      <div className="flex flex-col items-center py-2">
                        <span style={{ fontSize: 40, color }}>{icon}</span>
                        <Text ellipsis style={{ marginTop: 8, maxWidth: 160, textAlign: 'center' }}>
                          {file.name}
                        </Text>
                        <Space style={{ marginTop: 4 }}>
                          <Tag color={TYPE_COLORS[file.type] || 'default'}>{file.type.toUpperCase()}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>{file.size}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                          {file.uploader} · {file.uploadedAt}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <div className="flex justify-center mt-4">
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onChange={setPage}
                showTotal={(total) => `${total} files`}
              />
            </div>
          </>
        )}

        {/* Preview Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              File Details
            </Space>
          }
          open={!!previewFile}
          onCancel={() => setPreviewFile(null)}
          footer={[
            <Button key="close" onClick={() => setPreviewFile(null)}>Close</Button>,
          ]}
        >
          {previewFile && (
            <div>
              {(() => {
                const { icon, color } = getFileInfo(previewFile.name);
                return (
                  <div className="flex flex-col items-center py-4">
                    <span style={{ fontSize: 64, color }}>{icon}</span>
                  </div>
                );
              })()}
              <table style={{ width: '100%' }}>
                <tbody>
                  {[
                    ['Name', previewFile.name],
                    ['Type', previewFile.type.toUpperCase()],
                    ['Size', previewFile.size],
                    ['Category', previewFile.category],
                    ['Uploaded by', previewFile.uploader],
                    ['Upload date', previewFile.uploadedAt],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 0', color: '#8c8c8c', width: 120 }}>{label}</td>
                      <td style={{ padding: '8px 0', fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

export default FileListPage;
