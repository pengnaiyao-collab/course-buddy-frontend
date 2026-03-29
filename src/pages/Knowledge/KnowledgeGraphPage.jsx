import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  HomeOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import { getKnowledgeGraph } from '../../services/api/knowledge';

const { Title, Text, Paragraph } = Typography;

const VIEWPORT_W = 1200;
const VIEWPORT_H = 720;

const PALETTE = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#13c2c2', '#d46b08'];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function normalizeGraphData(raw) {
  const nodes = raw?.nodes || [];
  const edges = raw?.edges || [];
  const ids = new Set(nodes.map((n) => n.id));
  return {
    nodes,
    edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    totalNodes: raw?.totalNodes ?? nodes.length,
    totalEdges: raw?.totalEdges ?? edges.length,
  };
}

function buildLayout(nodes) {
  if (!nodes.length) return new Map();

  const categoryMap = new Map();
  nodes.forEach((n) => {
    const key = n.category || 'General';
    if (!categoryMap.has(key)) categoryMap.set(key, []);
    categoryMap.get(key).push(n);
  });

  const categories = Array.from(categoryMap.keys());
  const catCount = categories.length;
  const layout = new Map();

  categories.forEach((category, idx) => {
    const items = categoryMap.get(category);
    const angle = (Math.PI * 2 * idx) / catCount;
    const clusterRadius = Math.min(VIEWPORT_W, VIEWPORT_H) * 0.28;
    const centerX = VIEWPORT_W / 2 + Math.cos(angle) * clusterRadius;
    const centerY = VIEWPORT_H / 2 + Math.sin(angle) * clusterRadius;

    items.forEach((node, i) => {
      const ring = 40 + (Math.floor(i / 8) * 44);
      const a = (Math.PI * 2 * (i % 8)) / Math.min(8, items.length || 1);
      layout.set(node.id, {
        x: centerX + Math.cos(a) * ring,
        y: centerY + Math.sin(a) * ring,
      });
    });
  });

  return layout;
}

function KnowledgeGraphPage() {
  const courseId = Number(localStorage.getItem('selectedCourseId') || 1);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], totalNodes: 0, totalEdges: 0 });
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeGraph(courseId);
      setGraphData(normalizeGraphData(res.data));
    } catch {
      message.error('Failed to load knowledge graph');
      setGraphData({ nodes: [], edges: [], totalNodes: 0, totalEdges: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [courseId]);

  const categories = useMemo(() => {
    return Array.from(new Set((graphData.nodes || []).map((n) => n.category || 'General')));
  }, [graphData]);

  const categoryColor = useMemo(() => {
    const map = new Map();
    categories.forEach((c, i) => map.set(c, PALETTE[i % PALETTE.length]));
    return map;
  }, [categories]);

  const filteredNodes = useMemo(() => {
    if (filterCategory === 'all') return graphData.nodes;
    return graphData.nodes.filter((n) => (n.category || 'General') === filterCategory);
  }, [graphData, filterCategory]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));
  }, [graphData, visibleIds]);

  const positions = useMemo(() => buildLayout(filteredNodes), [filteredNodes]);

  const adjacency = useMemo(() => {
    const m = new Map();
    filteredEdges.forEach((e) => {
      if (!m.has(e.source)) m.set(e.source, new Set());
      if (!m.has(e.target)) m.set(e.target, new Set());
      m.get(e.source).add(e.target);
      m.get(e.target).add(e.source);
    });
    return m;
  }, [filteredEdges]);

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoom = (delta) => setScale((s) => clamp(s + delta, 0.45, 2.4));

  const onWheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? -0.08 : 0.08);
  };

  const onMouseDown = (e) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e) => {
    if (!isPanning) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setIsPanning(false);

  const selectedNeighbors = selectedNode ? (adjacency.get(selectedNode.id) || new Set()) : new Set();

  if (loading) {
    return (
      <AppLayout activeKey="/kb">
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeKey="/kb">
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/kb', title: 'Knowledge Base' },
            { title: 'Knowledge Graph' },
          ]}
        />

        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={3} style={{ margin: 0 }}>Knowledge Graph</Title>
            <Text type="secondary">Course {courseId} · interactive node-link visualization</Text>
          </div>
          <Space>
            <Select
              value={filterCategory}
              style={{ width: 220 }}
              onChange={setFilterCategory}
              options={[{ label: 'All Categories', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))]}
            />
            <Button icon={<MinusOutlined />} onClick={() => zoom(-0.1)} />
            <Button icon={<PlusOutlined />} onClick={() => zoom(0.1)} />
            <Button icon={<ShrinkOutlined />} onClick={resetView}>Reset</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchGraph}>Refresh</Button>
          </Space>
        </div>

        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 12, minHeight: 560 }}>
              {filteredNodes.length === 0 ? (
                <Empty description="No graph data yet. Try auto-analyzing a long document first." />
              ) : (
                <>
                  <Paragraph type="secondary">
                    Drag blank area to pan, mouse wheel to zoom, click a node to highlight its neighbors.
                  </Paragraph>
                  <div
                    ref={canvasRef}
                    style={{
                      height: 500,
                      borderRadius: 10,
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      cursor: isPanning ? 'grabbing' : 'grab',
                      background:
                        'radial-gradient(circle at 20% 20%, rgba(22,119,255,0.06), transparent 40%), radial-gradient(circle at 80% 70%, rgba(250,140,22,0.06), transparent 42%)',
                    }}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                  >
                    <svg width="100%" height="100%" viewBox={`0 0 ${VIEWPORT_W} ${VIEWPORT_H}`} preserveAspectRatio="xMidYMid meet">
                      <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                        {filteredEdges.map((e) => {
                          const s = positions.get(e.source);
                          const t = positions.get(e.target);
                          if (!s || !t) return null;
                          const active = selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id);
                          return (
                            <line
                              key={e.id || `${e.source}-${e.target}-${e.relationType}`}
                              x1={s.x}
                              y1={s.y}
                              x2={t.x}
                              y2={t.y}
                              stroke={active ? '#1677ff' : '#d9d9d9'}
                              strokeWidth={active ? 2.2 : 1.2}
                              opacity={selectedNode ? (active ? 1 : 0.35) : 0.78}
                            />
                          );
                        })}

                        {filteredNodes.map((n) => {
                          const p = positions.get(n.id);
                          if (!p) return null;
                          const category = n.category || 'General';
                          const isSelected = selectedNode?.id === n.id;
                          const isNeighbor = selectedNeighbors.has(n.id);
                          const faded = selectedNode && !isSelected && !isNeighbor;
                          const fill = categoryColor.get(category) || '#1677ff';
                          const radius = isSelected ? 19 : 14;
                          return (
                            <g key={n.id} onClick={(e) => { e.stopPropagation(); setSelectedNode(n); }} style={{ cursor: 'pointer' }}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={radius}
                                fill={fill}
                                fillOpacity={faded ? 0.2 : 0.95}
                                stroke={isSelected ? '#111' : '#fff'}
                                strokeWidth={isSelected ? 2.5 : 2}
                              />
                              <text
                                x={p.x}
                                y={p.y - (radius + 8)}
                                textAnchor="middle"
                                fontSize={12}
                                fill={faded ? '#bfbfbf' : '#222'}
                                style={{ userSelect: 'none', pointerEvents: 'none' }}
                              >
                                {(n.label || '').length > 24 ? `${n.label.slice(0, 24)}...` : n.label}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                </>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
              <Title level={5}>Statistics</Title>
              <div><Text>Nodes: {filteredNodes.length}</Text></div>
              <div><Text>Edges: {filteredEdges.length}</Text></div>
              <div><Text>Categories: {categories.length}</Text></div>
              <div><Text>Zoom: {(scale * 100).toFixed(0)}%</Text></div>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Title level={5}>Selected Node</Title>
              {!selectedNode ? (
                <Text type="secondary">Click a node to inspect details</Text>
              ) : (
                <Space direction="vertical" size={8}>
                  <Text strong>{selectedNode.label}</Text>
                  <Tag color={categoryColor.get(selectedNode.category || 'General') || 'blue'}>
                    {selectedNode.category || 'General'}
                  </Tag>
                  <Text type="secondary">{selectedNode.description || 'No description'}</Text>
                  {selectedNode.properties && (
                    <>
                      {selectedNode.properties.tags ? <Tag>Tags: {selectedNode.properties.tags}</Tag> : null}
                      {selectedNode.properties.sourceType ? <Tag>Source: {selectedNode.properties.sourceType}</Tag> : null}
                      {selectedNode.properties.status ? <Tag>Status: {selectedNode.properties.status}</Tag> : null}
                    </>
                  )}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}

export default KnowledgeGraphPage;
