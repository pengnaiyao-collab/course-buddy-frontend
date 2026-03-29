import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Space,
  Breadcrumb,
  Select,
  message,
  Row,
  Col,
  Spin,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text } = Typography;

function KnowledgeGraphPage() {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 1, label: 'Binary Trees', category: 'Data Structures', size: 50 },
      { id: 2, label: 'AVL Trees', category: 'Data Structures', size: 40 },
      { id: 3, label: 'Hash Tables', category: 'Data Structures', size: 45 },
      { id: 4, label: 'Tree Traversal', category: 'Algorithms', size: 35 },
      { id: 5, label: 'Sorting', category: 'Algorithms', size: 40 },
    ],
    edges: [
      { source: 1, target: 2, relationship: 'DERIVED_FROM' },
      { source: 1, target: 4, relationship: 'RELATED' },
      { source: 2, target: 3, relationship: 'SUPPLEMENTS' },
      { source: 4, target: 5, relationship: 'RELATED' },
    ],
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        // TODO: Call API to fetch knowledge graph
        setGraphData(graphData);
      } catch {
        // Already has mock data
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const categories = Array.from(
    new Set(graphData.nodes.map((n) => n.category))
  );

  const filteredNodes = filterCategory === 'all'
    ? graphData.nodes
    : graphData.nodes.filter((n) => n.category === filterCategory);

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
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { href: '/knowledge', title: 'Knowledge Base' },
            { title: 'Knowledge Graph' },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              🧠 Knowledge Graph
            </Title>
            <Text type="secondary">Interactive visualization of knowledge relationships</Text>
          </div>
          <Space>
            <Select
              placeholder="Filter by category"
              allowClear
              value={filterCategory}
              onChange={setFilterCategory}
              style={{ width: 200 }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => setGraphData(graphData)}>
              Refresh
            </Button>
          </Space>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={18}>
            <Card style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty
                description="Knowledge Graph Visualization"
                style={{ marginTop: 0 }}
              >
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Interactive graph requires cytoscape.js library integration
                </Text>
              </Empty>
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card title="Statistics" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Knowledge Items</Text>
                <div style={{ fontSize: 24, color: '#1677ff' }}>
                  {filteredNodes.length}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Relations</Text>
                <div style={{ fontSize: 24, color: '#52c41a' }}>
                  {graphData.edges.length}
                </div>
              </div>
              <div>
                <Text strong>Categories</Text>
                <div style={{ fontSize: 24, color: '#faad14' }}>
                  {categories.length}
                </div>
              </div>
            </Card>

            <Card title="Knowledge Items">
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {filteredNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: selectedNode?.id === node.id ? '#e6f7ff' : '#f5f5f5',
                      border: selectedNode?.id === node.id ? '1px solid #1677ff' : '1px solid #e8e8e8',
                    }}
                  >
                    <Text strong style={{ fontSize: 14 }}>
                      {node.label}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {node.category}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {selectedNode && (
          <Card style={{ marginTop: 24 }}>
            <Title level={4}>{selectedNode.label}</Title>
            <Space>
              <Text type="secondary">Category: {selectedNode.category}</Text>
              <Button type="link" size="small">
                View Details →
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default KnowledgeGraphPage;
