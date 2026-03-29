import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Typography,
  Input,
  Breadcrumb,
  Space,
  Card,
  Empty,
  Spin,
  Tag,
  List,
  Button,
  Select,
  Row,
  Col,
  Pagination,
} from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;

const MOCK_RESULTS = [
  {
    id: 1,
    type: 'knowledge',
    title: 'Binary Search Trees',
    description: 'A fundamental data structure where each node has at most two children...',
    category: 'Data Structures',
    score: 0.95,
  },
  {
    id: 2,
    type: 'note',
    title: 'My BST Implementation Notes',
    description: 'Personal notes on implementing BST operations including insertion and deletion...',
    category: 'Study Notes',
    score: 0.87,
  },
  {
    id: 3,
    type: 'course',
    title: 'Data Structures & Algorithms Course',
    description: 'Comprehensive course on DSA including trees, graphs, sorting algorithms...',
    category: 'Courses',
    score: 0.82,
  },
];

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        // TODO: Call API with query
        // Simulating search results
        setResults(MOCK_RESULTS.filter(r => 
          filterType === 'all' || r.type === filterType
        ));
      } catch {
        setResults(MOCK_RESULTS);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      performSearch();
    }
  }, [query, filterType]);

  const getIcon = (type) => {
    switch(type) {
      case 'knowledge':
        return <BookOutlined />;
      case 'note':
        return <FileTextOutlined />;
      case 'course':
        return <BookOutlined />;
      case 'discussion':
        return <MessageOutlined />;
      default:
        return <SearchOutlined />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'knowledge':
        return 'blue';
      case 'note':
        return 'green';
      case 'course':
        return 'orange';
      case 'discussion':
        return 'purple';
      default:
        return 'default';
    }
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            { href: '/', title: <HomeOutlined /> },
            { title: 'Search Results' },
          ]}
        />

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                size="large"
                prefix={<SearchOutlined />}
                placeholder="Search across all content..."
                defaultValue={query}
                allowClear
              />
            </Col>
            <Col>
              <Select
                defaultValue="all"
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'knowledge', label: 'Knowledge Items' },
                  { value: 'note', label: 'Notes' },
                  { value: 'course', label: 'Courses' },
                  { value: 'discussion', label: 'Discussions' },
                ]}
                style={{ width: 150 }}
              />
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            Search Results for "<strong>{query}</strong>"
            <Text type="secondary" style={{ marginLeft: 16 }}>
              {results.length} results found
            </Text>
          </Title>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : results.length === 0 ? (
          <Empty description="No results found" />
        ) : (
          <>
            <List
              dataSource={paginatedResults}
              renderItem={(item) => (
                <Card style={{ marginBottom: 16 }}>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<div style={{ fontSize: 24 }}>{getIcon(item.type)}</div>}
                      title={
                        <div>
                          <Button type="link" style={{ paddingLeft: 0, fontSize: 16 }}>
                            {item.title}
                          </Button>
                          <Tag color={getColor(item.type)} style={{ marginLeft: 12 }}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Tag>
                          <Tag color="default">Category: {item.category}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                            {item.description}
                          </Paragraph>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Relevance: {Math.round(item.score * 100)}%
                            </Text>
                            <Button type="link" size="small">View Details →</Button>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                </Card>
              )}
            />

            {results.length > pageSize && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={results.length}
                  onChange={setCurrentPage}
                  onShowSizeChange={(_, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  showSizeChanger
                  showTotal={(total) => `Total ${total} results`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default SearchResultsPage;
