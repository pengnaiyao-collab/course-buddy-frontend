import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  BulbOutlined,
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { useSearchParams } from 'react-router-dom';
import {
  addKnowledgeResource,
  autoAnalyzeKnowledge,
  createKnowledgePoint,
  deleteKnowledgePoint,
  deleteKnowledgeResource,
  getKnowledgeMindmap,
  listKnowledgeAuditLogs,
  listKnowledgePoints,
  listKnowledgeResources,
  listKnowledgeVersions,
  rollbackKnowledgeVersion,
  searchKnowledgePointsAdvanced,
  updateKnowledgePoint,
} from '../../services/api/knowledge';

const { Title, Text, Paragraph } = Typography;
const { Search, TextArea } = Input;

const TAG_COLORS = ['blue', 'green', 'red', 'orange', 'purple', 'cyan', 'magenta', 'gold', 'lime'];
const RESOURCE_TYPES = ['NOTE', 'SLIDE', 'EXAM', 'HOMEWORK', 'VIDEO', 'AUDIO', 'LINK'];

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags).split(',').map((t) => t.trim()).filter(Boolean);
};

const parseMindmapTree = (text) => {
  if (!text) return null;
  const rawLines = String(text).split('\n').map((l) => l.replace(/\t/g, '  '));
  const lines = rawLines
    .filter((l) => l.trim())
    .filter((l) => l.trim().toLowerCase() !== 'mindmap');
  if (!lines.length) return null;

  const normalizeLabel = (label) => label
    .replace(/^root\s*\(\(/i, '')
    .replace(/\)\)\s*$/, '')
    .trim();

  const withMeta = lines.map((line, idx) => ({
    idx,
    indent: line.match(/^ */)?.[0]?.length || 0,
    label: normalizeLabel(line.trim()),
  }));

  const root = { id: 'root', label: withMeta[0].label, children: [] };
  const stack = [{ indent: withMeta[0].indent, node: root }];

  for (let i = 1; i < withMeta.length; i += 1) {
    const current = withMeta[i];
    const node = { id: `n-${i}`, label: current.label, children: [] };
    while (stack.length > 0 && current.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack.length ? stack[stack.length - 1].node : root;
    parent.children.push(node);
    stack.push({ indent: current.indent, node });
  }
  return root;
};

function KnowledgePointPage() {
  const [searchParams] = useSearchParams();
  const courseId = Number(localStorage.getItem('selectedCourseId') || 1);
  const [points, setPoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagMode, setTagMode] = useState('OR');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [mindmapOpen, setMindmapOpen] = useState(false);
  const [mindmapText, setMindmapText] = useState('');
  const [sourceSnippet, setSourceSnippet] = useState('');
  const [versionOpen, setVersionOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();
  const [resourceForm] = Form.useForm();
  const [analyzeForm] = Form.useForm();

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (keyword || selectedTags.length) {
        res = await searchKnowledgePointsAdvanced(courseId, {
          keyword,
          tags: selectedTags,
          tagMode,
        });
      } else {
        res = await listKnowledgePoints(courseId);
      }
      const data = res.data?.content || res.data || [];
      const normalized = data.map((p) => ({
        ...p,
        content: p.content || p.description || '',
        tagsArray: parseTags(p.tags),
      }));
      setPoints(normalized);
      if (normalized.length && (!selected || !normalized.some((p) => p.id === selected.id))) {
        setSelected(normalized[0]);
      } else if (!normalized.length) {
        setSelected(null);
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to load knowledge points');
    } finally {
      setLoading(false);
    }
  }, [courseId, keyword, selectedTags, tagMode, selected]);

  const fetchResources = useCallback(async (itemId) => {
    if (!itemId) return;
    setResourceLoading(true);
    try {
      const res = await listKnowledgeResources(courseId, itemId);
      setResources(res.data || []);
    } catch {
      setResources([]);
    } finally {
      setResourceLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    const snippet = searchParams.get('snippet');
    const queryItemId = Number(searchParams.get('itemId') || 0);
    if (snippet) {
      setSourceSnippet(snippet);
    } else {
      setSourceSnippet('');
    }
    if (queryItemId && points.length) {
      const hit = points.find((p) => p.id === queryItemId);
      if (hit) {
        setSelected(hit);
      }
    }
  }, [searchParams, points]);

  useEffect(() => {
    if (selected?.id) fetchResources(selected.id);
    else setResources([]);
  }, [selected, fetchResources]);

  const allTags = useMemo(() => {
    const set = new Set();
    points.forEach((p) => p.tagsArray.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [points]);

  const mindmapTree = useMemo(() => parseMindmapTree(mindmapText), [mindmapText]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ tags: [] });
    setEditOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      tags: item.tagsArray,
      fileUrl: item.fileUrl,
      fileType: item.fileType,
    });
    setEditOpen(true);
  };

  const onSave = async (values) => {
    setSaving(true);
    const payload = {
      title: values.title,
      description: values.description,
      content: values.content,
      category: values.category,
      tags: (values.tags || []).join(','),
      fileUrl: values.fileUrl,
      fileType: values.fileType,
    };
    try {
      if (editing) {
        await updateKnowledgePoint(courseId, editing.id, payload);
        message.success('Knowledge point updated');
      } else {
        await createKnowledgePoint(courseId, payload);
        message.success('Knowledge point created');
      }
      setEditOpen(false);
      fetchPoints();
    } catch {
      message.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteKnowledgePoint(courseId, id);
      message.success('Deleted');
      fetchPoints();
    } catch {
      message.error('Delete failed');
    }
  };

  const onAddResource = async (values) => {
    if (!selected?.id) return;
    try {
      await addKnowledgeResource(courseId, selected.id, values);
      message.success('Resource attached');
      setResourceOpen(false);
      resourceForm.resetFields();
      fetchResources(selected.id);
    } catch {
      message.error('Attach resource failed');
    }
  };

  const onDeleteResource = async (resourceId) => {
    if (!selected?.id) return;
    try {
      await deleteKnowledgeResource(courseId, selected.id, resourceId);
      message.success('Resource removed');
      fetchResources(selected.id);
    } catch {
      message.error('Remove resource failed');
    }
  };

  const onAutoAnalyze = async (values) => {
    setSaving(true);
    try {
      const res = await autoAnalyzeKnowledge(courseId, {
        title: values.title,
        text: values.text,
        category: values.category,
        tags: (values.tags || []).join(','),
        fileType: values.fileType,
      });
      const count = res.data?.totalCreated ?? 0;
      message.success(`Auto analysis completed, created ${count} items`);
      setAnalyzeOpen(false);
      analyzeForm.resetFields();
      fetchPoints();
    } catch {
      message.error('Auto analysis failed');
    } finally {
      setSaving(false);
    }
  };

  const onGenerateMindmap = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const res = await getKnowledgeMindmap(courseId, selected.id);
      setMindmapText(res.data || '');
      setMindmapOpen(true);
    } catch {
      message.error('Generate mind map failed');
    } finally {
      setSaving(false);
    }
  };

  const onOpenVersions = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const res = await listKnowledgeVersions(courseId, selected.id);
      setVersions(res.data || []);
      setVersionOpen(true);
    } catch {
      message.error('Load versions failed');
    } finally {
      setSaving(false);
    }
  };

  const onRollbackVersion = async (versionNumber) => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await rollbackKnowledgeVersion(courseId, selected.id, versionNumber);
      message.success(`Rolled back to v${versionNumber}`);
      setVersionOpen(false);
      fetchPoints();
    } catch {
      message.error('Rollback failed');
    } finally {
      setSaving(false);
    }
  };

  const onOpenAuditLogs = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const res = await listKnowledgeAuditLogs(courseId, selected.id, { size: 100 });
      setAuditLogs(res.data?.content || res.data || []);
      setAuditOpen(true);
    } catch {
      message.error('Load audit logs failed');
    } finally {
      setSaving(false);
    }
  };

  const renderMindmapNode = (node, depth = 0) => (
    <div key={node.id} style={{ marginLeft: depth * 18, marginTop: 8 }}>
      <Tag color={depth === 0 ? 'blue' : 'default'} style={{ marginRight: 8 }}>
        {depth === 0 ? 'ROOT' : `L${depth}`}
      </Tag>
      <Text>{node.label}</Text>
      {(node.children || []).map((child) => renderMindmapNode(child, depth + 1))}
    </div>
  );

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={3} style={{ margin: 0 }}>Knowledge Parsing & Association</Title>
            <Text type="secondary">Course {courseId} · auto parse, graph-ready associations, advanced search</Text>
          </div>
          <Space>
            <Button icon={<FileSearchOutlined />} onClick={() => setAnalyzeOpen(true)}>
              Auto Analyze Long Text
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Knowledge Point</Button>
          </Space>
        </div>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Supports: long-document auto splitting, core/difficult/exam extraction, tag combination search (AND/OR), and multi-resource attachment."
        />

        <Row gutter={16} style={{ height: 'calc(100vh - 240px)' }}>
          <Col xs={24} md={9} style={{ height: '100%' }}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: 12, height: '100%', overflow: 'auto' }}
            >
              <Search
                allowClear
                placeholder="Search by keyword"
                onSearch={setKeyword}
                onChange={(e) => setKeyword(e.target.value)}
                value={keyword}
                style={{ marginBottom: 10 }}
              />
              <Space style={{ marginBottom: 10 }}>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Filter tags"
                  style={{ minWidth: 220 }}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={allTags.map((t) => ({ label: t, value: t }))}
                />
                <Select
                  value={tagMode}
                  onChange={setTagMode}
                  style={{ width: 90 }}
                  options={[
                    { label: 'OR', value: 'OR' },
                    { label: 'AND', value: 'AND' },
                  ]}
                />
              </Space>

              <Spin spinning={loading}>
                {points.length === 0 ? (
                  <Empty description="No knowledge points" />
                ) : (
                  points.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelected(p)}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selected?.id === p.id ? '#e6f4ff' : '#fafafa',
                        border: selected?.id === p.id ? '1px solid #91caff' : '1px solid #f0f0f0',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <Text strong ellipsis style={{ maxWidth: 180 }}>{p.title}</Text>
                        <Space size={4}>
                          <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(p); }} />
                          <Popconfirm title="Delete this knowledge point?" onConfirm={(e) => { e?.stopPropagation(); onDelete(p.id); }}>
                            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                          </Popconfirm>
                        </Space>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {p.tagsArray.map((t, i) => (
                          <Tag key={`${p.id}-${t}`} color={TAG_COLORS[i % TAG_COLORS.length]}>{t}</Tag>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </Spin>
            </Card>
          </Col>

          <Col xs={24} md={15} style={{ height: '100%' }}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: 16, height: '100%', overflow: 'auto' }}
            >
              {!selected ? (
                <Empty description="Select a knowledge point" />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{selected.title}</Title>
                      <Space size={8} style={{ marginTop: 6 }}>
                        <Tag icon={<BulbOutlined />}>{selected.category || 'General'}</Tag>
                        <Tag>{selected.sourceType || 'MANUAL'}</Tag>
                        <Tag color="green">{selected.status || 'PUBLISHED'}</Tag>
                      </Space>
                    </div>
                    <Space>
                      <Button icon={<HistoryOutlined />} onClick={onOpenVersions}>Version History</Button>
                      <Button icon={<ClockCircleOutlined />} onClick={onOpenAuditLogs}>Audit Trail</Button>
                      <Button onClick={onGenerateMindmap}>Generate Mind Map</Button>
                      <Button icon={<LinkOutlined />} onClick={() => setResourceOpen(true)}>Attach Resource</Button>
                    </Space>
                  </div>

                  <Divider />
                  {sourceSnippet ? (
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 12 }}
                      message="Source verification snippet"
                      description={sourceSnippet}
                    />
                  ) : null}
                  <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {selected.content || selected.description || 'No content'}
                  </Paragraph>

                  <Divider orientation="left">Attached Multi-Type Resources</Divider>
                  <Spin spinning={resourceLoading}>
                    <List
                      locale={{ emptyText: 'No resources attached' }}
                      dataSource={resources}
                      renderItem={(r) => (
                        <List.Item
                          actions={[
                            <a key="open" href={r.url} target="_blank" rel="noreferrer">Open</a>,
                            <Popconfirm key="del" title="Delete resource?" onConfirm={() => onDeleteResource(r.id)}>
                              <a>Delete</a>
                            </Popconfirm>,
                          ]}
                        >
                          <List.Item.Meta
                            title={<Space><Tag color="blue">{r.resourceType}</Tag>{r.title}</Space>}
                            description={r.description || r.url}
                          />
                        </List.Item>
                      )}
                    />
                  </Spin>
                </>
              )}
            </Card>
          </Col>
        </Row>

        <Modal
          title={editing ? 'Edit Knowledge Point' : 'New Knowledge Point'}
          open={editOpen}
          onCancel={() => setEditOpen(false)}
          onOk={() => form.submit()}
          okText="Save"
          confirmLoading={saving}
          width={760}
        >
          <Form form={form} layout="vertical" onFinish={onSave}>
            <Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Category" name="category"><Input /></Form.Item>
            <Form.Item label="Tags" name="tags">
              <Select mode="tags" placeholder="Press Enter to add tags" />
            </Form.Item>
            <Form.Item label="Description" name="description"><TextArea rows={2} /></Form.Item>
            <Form.Item label="Content" name="content"><TextArea rows={7} /></Form.Item>
            <Form.Item label="File URL" name="fileUrl"><Input /></Form.Item>
            <Form.Item label="File Type" name="fileType"><Input /></Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Auto Analyze Long Document"
          open={analyzeOpen}
          onCancel={() => setAnalyzeOpen(false)}
          onOk={() => analyzeForm.submit()}
          okText="Analyze & Generate"
          confirmLoading={saving}
          width={900}
        >
          <Form form={analyzeForm} layout="vertical" onFinish={onAutoAnalyze}>
            <Form.Item label="Document Title" name="title" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Category" name="category"><Input placeholder="e.g. Algorithms" /></Form.Item>
            <Form.Item label="Tags" name="tags"><Select mode="tags" /></Form.Item>
            <Form.Item label="File Type" name="fileType"><Input placeholder="PDF / DOCX / OCR" /></Form.Item>
            <Form.Item label="Long Text Content" name="text" rules={[{ required: true }]}>
              <TextArea rows={14} placeholder="Paste long lecture notes / textbook content here..." />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Attach Resource"
          open={resourceOpen}
          onCancel={() => setResourceOpen(false)}
          onOk={() => resourceForm.submit()}
          okText="Attach"
        >
          <Form form={resourceForm} layout="vertical" onFinish={onAddResource}>
            <Form.Item label="Resource Type" name="resourceType" rules={[{ required: true }]}>
              <Select options={RESOURCE_TYPES.map((t) => ({ label: t, value: t }))} />
            </Form.Item>
            <Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="URL" name="url" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Description" name="description"><TextArea rows={3} /></Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Mind Map (Mermaid)"
          open={mindmapOpen}
          onCancel={() => setMindmapOpen(false)}
          footer={null}
          width={900}
        >
          <Text type="secondary">Visualized mind map:</Text>
          <div style={{ marginTop: 10, marginBottom: 14, maxHeight: 320, overflow: 'auto', padding: 10, border: '1px solid #f0f0f0', borderRadius: 8 }}>
            {mindmapTree ? renderMindmapNode(mindmapTree) : <Empty description="No mindmap structure detected" />}
          </div>
          <Text type="secondary">Mermaid source:</Text>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 12, borderRadius: 8, marginTop: 8 }}>
            {mindmapText}
          </pre>
        </Modal>

        <Modal
          title="Version History"
          open={versionOpen}
          onCancel={() => setVersionOpen(false)}
          footer={null}
          width={860}
        >
          <List
            locale={{ emptyText: 'No version history' }}
            dataSource={versions}
            renderItem={(v) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="rollback"
                    title={`Rollback to v${v.versionNumber}?`}
                    onConfirm={() => onRollbackVersion(v.versionNumber)}
                  >
                    <a>Rollback</a>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<Space><Tag color="blue">v{v.versionNumber}</Tag><Text>{v.description || 'No description'}</Text></Space>}
                  description={`CreatedBy: ${v.createdBy || '-'} · ${v.createdAt || ''}`}
                />
              </List.Item>
            )}
          />
        </Modal>

        <Modal
          title="Audit Trail"
          open={auditOpen}
          onCancel={() => setAuditOpen(false)}
          footer={null}
          width={980}
        >
          <List
            locale={{ emptyText: 'No audit logs' }}
            dataSource={auditLogs}
            renderItem={(log) => (
              <List.Item>
                <List.Item.Meta
                  title={<Space><Tag color="purple">{log.action}</Tag><Text>{log.createdAt || ''}</Text></Space>}
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">Operator: {log.operatorName || '-'} (#{log.operatorId || '-'})</Text>
                      {log.oldValue ? <Text type="secondary" ellipsis={{ tooltip: log.oldValue }}>OLD: {log.oldValue}</Text> : null}
                      {log.newValue ? <Text type="secondary" ellipsis={{ tooltip: log.newValue }}>NEW: {log.newValue}</Text> : null}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Modal>
      </div>
    </AppLayout>
  );
}

export default KnowledgePointPage;
