import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Typography,
  Card,
  Button,
  Input,
  List,
  Tag,
  Modal,
  Form,
  Breadcrumb,
  Space,
  Popconfirm,
  Empty,
  Select,
  message,
  Spin,
  Tooltip,
  Divider,
  Tabs,
  Row,
  Col,
  Timeline,
  Table,
  Radio,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  CopyOutlined,
  HistoryOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  listCategories,
  shareNote,
  exportNote,
  getShareLink,
  getNoteVersions,
  getNoteVersionDiff,
  restoreNoteVersion,
  deleteNoteVersion,
} from '../../services/api/notes';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const SAMPLE_NOTES = [
  {
    id: 1,
    title: 'Binary Trees Overview',
    content:
      'A binary tree is a tree data structure where each node has at most two children referred to as the left and right child.',
    tags: ['DSA', 'Trees'],
    category: 'Study Notes',
    updatedAt: '2024-03-15',
  },
  {
    id: 2,
    title: 'React Hooks Cheatsheet',
    content:
      'useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef are the core React hooks.',
    tags: ['React', 'Web Dev'],
    category: 'Reference',
    updatedAt: '2024-03-18',
  },
  {
    id: 3,
    title: 'SQL JOIN Types',
    content:
      'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN — understanding the differences is key to mastering relational databases.',
    tags: ['Database', 'SQL'],
    category: 'Study Notes',
    updatedAt: '2024-03-20',
  },
];

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [editorContent, setEditorContent] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('markdown');

  // New states for share/export
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNoteForShare, setSelectedNoteForShare] = useState(null);
  const [shareLink, setShareLink] = useState('');

  // New states for version management
  const [versionHistoryModalOpen, setVersionHistoryModalOpen] = useState(false);
  const [selectedNoteForVersions, setSelectedNoteForVersions] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [versionDiff, setVersionDiff] = useState(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNotes({ category: selectedCategory || undefined, q: searchQuery || undefined });
      setNotes(res.data?.notes || res.data || []);
    } catch {
      // Fall back to sample data if API is unavailable
      setNotes(SAMPLE_NOTES);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await listCategories();
      const cats = res.data?.categories || res.data || [];
      setCategories(cats);
    } catch {
      setCategories(['Study Notes', 'Reference', 'Assignments', 'Research']);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openCreate = () => {
    setEditingNote(null);
    setEditorContent('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setEditorContent(note.content || '');
    form.setFieldsValue({
      title: note.title,
      tags: note.tags || [],
      category: note.category,
    });
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    if (!editorContent.trim()) {
      message.error('Please enter some content');
      return;
    }
    setSaving(true);
    const payload = {
      title: values.title,
      content: editorContent,
      tags: values.tags || [],
      category: values.category,
    };
    try {
      if (editingNote) {
        await updateNote(editingNote.id, payload);
        message.success('Note updated');
      } else {
        await createNote(payload);
        message.success('Note created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditorContent('');
      fetchNotes();
    } catch {
      // Optimistic local update if API fails
      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? { ...n, ...payload, updatedAt: new Date().toISOString().split('T')[0] }
              : n
          )
        );
        message.success('Note updated (offline)');
      } else {
        setNotes((prev) => [
          { id: Date.now(), ...payload, updatedAt: new Date().toISOString().split('T')[0] },
          ...prev,
        ]);
        message.success('Note created (offline)');
      }
      setModalOpen(false);
      form.resetFields();
      setEditorContent('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      message.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      message.success('Note deleted (offline)');
    }
  };

  // Share functionality
  const handleOpenShare = async (note) => {
    setSelectedNoteForShare(note);
    try {
      const res = await getShareLink(note.id);
      setShareLink(res.data?.link || `share/${note.id}`);
    } catch {
      setShareLink(`share/${note.id}`);
    }
    setShareModalOpen(true);
  };

  const handleCopyShareLink = () => {
    const fullLink = `${window.location.origin}/notes/${shareLink}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      message.success('Share link copied to clipboard!');
    });
  };

  // Export functionality
  const handleExportNote = async (note, format) => {
    try {
      const blob = await exportNote(note.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title}.${format === 'pdf' ? 'pdf' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success(`Note exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.warn('Export failed:', err);
      message.error('Export failed. Please try again.');
    }
  };

  // Version Management Functions
  const handleOpenVersionHistory = async (note) => {
    setSelectedNoteForVersions(note);
    setVersionsLoading(true);
    setSelectedVersions([]);
    setVersionDiff(null);
    try {
      const res = await getNoteVersions(note.id, { page: 0, size: 50 });
      setVersions(res.data || []);
      setVersionHistoryModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
      message.error('Failed to load version history');
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleVersionSelect = (record) => {
    setSelectedVersions((prev) => {
      const isAlreadySelected = prev.some((v) => v.id === record.id);
      if (isAlreadySelected) {
        return prev.filter((v) => v.id !== record.id);
      }
      if (prev.length < 2) {
        return [...prev, record];
      }
      return [prev[1], record];
    });
  };

  const handleComparVersions = async () => {
    if (selectedVersions.length !== 2) {
      message.warning('Please select exactly 2 versions to compare');
      return;
    }

    try {
      const res = await getNoteVersionDiff(
        selectedNoteForVersions.id,
        selectedVersions[0].id,
        selectedVersions[1].id
      );
      setVersionDiff(res.data);
      setDiffModalOpen(true);
    } catch (err) {
      console.error('Failed to compare versions:', err);
      message.error('Failed to compare versions');
    }
  };

  const handleRestoreVersion = async (versionId) => {
    try {
      await restoreNoteVersion(selectedNoteForVersions.id, versionId);
      message.success('Note restored from version');
      setVersionHistoryModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error('Failed to restore version:', err);
      message.error('Failed to restore version');
    }
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await deleteNoteVersion(selectedNoteForVersions.id, versionId);
      message.success('Version deleted');
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
    } catch (err) {
      console.error('Failed to delete version:', err);
      message.error('Failed to delete version');
    }
  };

  const filtered = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    const matchCat = !selectedCategory || n.category === selectedCategory;
    return matchQ && matchCat;
  });

  const tagOptions = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).map((t) => ({ value: t, label: t }));

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'My Notes' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>📝 My Notes</Title>
            <Text type="secondary">Capture and organize your learning notes.</Text>
          </div>
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchNotes} loading={loading} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New Note
            </Button>
          </Space>
        </div>

        <Space style={{ marginBottom: 24 }} wrap>
          <Search
            placeholder="Search notes…"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty description="No notes found" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
            dataSource={filtered}
            renderItem={(note) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="versions"
                      type="link"
                      icon={<HistoryOutlined />}
                      onClick={() => handleOpenVersionHistory(note)}
                      title="View version history"
                    >
                      Versions
                    </Button>,
                    <Button
                      key="share"
                      type="link"
                      icon={<ShareAltOutlined />}
                      onClick={() => handleOpenShare(note)}
                      title="Share note"
                    >
                      Share
                    </Button>,
                    <Button
                      key="export"
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => handleExportNote(note, 'pdf')}
                      title="Export as PDF"
                    >
                      Export
                    </Button>,
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(note)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete this note?"
                      onConfirm={() => handleDelete(note.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={note.title}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#595959', marginBottom: 8 }}>
                          {note.content}
                        </Paragraph>
                        {note.category && (
                          <Tag icon={<FileTextOutlined />} color="blue" style={{ marginBottom: 6 }}>
                            {note.category}
                          </Tag>
                        )}
                        <Space wrap style={{ marginBottom: 6 }}>
                          {(note.tags || []).map((tag) => (
                            <Tag key={tag} icon={<TagOutlined />} color="geekblue">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                        <Text style={{ color: '#bfbfbf', fontSize: 12, display: 'block' }}>
                          Updated: {note.updatedAt}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>

      <Modal
        title={editingNote ? 'Edit Note' : 'New Note'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Content
            </label>
            <div style={{ marginBottom: 8 }}>
              <Radio.Group value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)}>
                <Radio value="markdown">Markdown</Radio>
                <Radio value="plaintext">Plain Text</Radio>
                <Radio value="html">HTML</Radio>
                <Radio value="javascript">JavaScript</Radio>
              </Radio.Group>
            </div>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
              <Editor
                height="400px"
                language={editorLanguage}
                value={editorContent}
                onChange={(value) => setEditorContent(value || '')}
                theme="light"
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <Form.Item name="category" label="Category">
            <Select
              placeholder="Select or type a category"
              allowClear
              showSearch
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags (press Enter to create)"
              options={tagOptions}
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Share Note Modal */}
      <Modal
        title="Share Note"
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
      >
        {selectedNoteForShare && (
          <div>
            <Text type="secondary">Share this note with others using the link below:</Text>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Input
                value={shareLink}
                readOnly
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={handleCopyShareLink}
              >
                Copy
              </Button>
            </div>
            <Divider />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Anyone with this link can view your note. You can revoke access anytime by deleting the share link.
            </Text>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button onClick={() => setShareModalOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Version History Modal */}
      <Modal
        title={`Version History - ${selectedNoteForVersions?.title}`}
        open={versionHistoryModalOpen}
        onCancel={() => {
          setVersionHistoryModalOpen(false);
          setSelectedVersions([]);
          setVersionDiff(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setVersionHistoryModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="compare"
            type="primary"
            onClick={handleComparVersions}
            disabled={selectedVersions.length !== 2}
          >
            Compare Selected
          </Button>,
        ]}
      >
        {versionsLoading ? (
          <Spin />
        ) : versions.length === 0 ? (
          <Empty description="No versions found" />
        ) : (
          <div>
            <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
              Select up to 2 versions to compare
            </Text>
            <Table
              dataSource={versions}
              columns={[
                {
                  title: 'Version',
                  dataIndex: 'versionNo',
                  key: 'versionNo',
                  width: 80,
                },
                {
                  title: 'Created At',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => new Date(date).toLocaleString(),
                },
                {
                  title: 'Author',
                  dataIndex: 'changedByName',
                  key: 'changedByName',
                  render: (name) => name || 'Unknown',
                },
                {
                  title: 'Description',
                  dataIndex: 'changeDesc',
                  key: 'changeDesc',
                  render: (desc) => desc || '-',
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 200,
                  render: (_, record) => (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        icon={<UndoOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Restore Version',
                            content: `Restore note to version ${record.versionNo}?`,
                            okText: 'Yes',
                            cancelText: 'No',
                            onOk() {
                              handleRestoreVersion(record.id);
                            },
                          });
                        }}
                      >
                        Restore
                      </Button>,
                      <Popconfirm
                        title="Delete Version"
                        description={`Delete version ${record.versionNo}?`}
                        onConfirm={() => handleDeleteVersion(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>,
                    </Space>
                  ),
                },
              ]}
              rowSelection={{
                selectedRowKeys: selectedVersions.map((v) => v.id),
                onChange: (_, selectedRows) => setSelectedVersions(selectedRows),
                type: 'checkbox',
                hideSelectAll: true,
              }}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Version Diff Modal */}
      <Modal
        title="Version Comparison"
        open={diffModalOpen}
        onCancel={() => setDiffModalOpen(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDiffModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {versionDiff && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Text strong>Version {versionDiff.versionA?.versionNo}</Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(versionDiff.versionA?.createdAt).toLocaleString()}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    By: {versionDiff.versionA?.changedByName || 'Unknown'}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text strong>Version {versionDiff.versionB?.versionNo}</Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(versionDiff.versionB?.createdAt).toLocaleString()}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    By: {versionDiff.versionB?.changedByName || 'Unknown'}
                  </Text>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Diff View</Divider>

            {versionDiff.lines && versionDiff.lines.length > 0 ? (
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 400,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {versionDiff.lines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor:
                        line.type === 'DELETE'
                          ? '#ffebee'
                          : line.type === 'INSERT'
                          ? '#e8f5e9'
                          : 'transparent',
                      padding: '2px 4px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          line.type === 'DELETE'
                            ? '#c62828'
                            : line.type === 'INSERT'
                            ? '#2e7d32'
                            : '#666',
                        marginRight: 8,
                      }}
                    >
                      {line.type === 'DELETE'
                        ? '-'
                        : line.type === 'INSERT'
                        ? '+'
                        : ' '}
                    </Text>
                    {line.content}
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No differences found" />
            )}

            {versionDiff.unifiedDiff && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Raw Diff: Copy the text below for detailed comparison
                </Text>
                <Input.TextArea
                  value={versionDiff.unifiedDiff}
                  readOnly
                  rows={6}
                  style={{ fontFamily: 'monospace', fontSize: 11, marginTop: 8 }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

export default NotesPage;