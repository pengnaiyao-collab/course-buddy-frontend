import React, { useEffect, useState } from 'react';
import {
  Input,
  Tabs,
  List,
  Tag,
  Button,
  Typography,
  Space,
  Empty,
  Spin,
  Select,
  Card,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  HistoryOutlined,
  CloseOutlined,
  FileTextOutlined,
  BookOutlined,
  FolderOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import {
  setQuery,
  setResults,
  setActiveTab,
  addToHistory,
  removeFromHistory,
  clearHistory,
  setLoading,
} from '../../store/slices/searchSlice';
import { globalSearch } from '../../services/api/search';

const { Title, Text } = Typography;

const MOCK_RESULTS = {
  notes: [
    { id: 1, title: 'Data Structures Summary', content: 'Key concepts: arrays, linked lists, trees...', tags: ['CS', 'Algorithms'], updatedAt: '2024-03-20' },
    { id: 2, title: 'React Hooks Cheatsheet', content: 'useState, useEffect, useContext...', tags: ['React', 'Web'], updatedAt: '2024-03-18' },
  ],
  courses: [
    { id: 1, title: 'CS101: Introduction to Computer Science', instructor: 'Prof. Chen', students: 120 },
    { id: 2, title: 'Web Development Fundamentals', instructor: 'Prof. Li', students: 85 },
  ],
  files: [
    { id: 1, name: 'Lecture_Slides_Week1.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '2024-03-15' },
    { id: 2, name: 'Assignment_3_Solution.docx', type: 'Word', size: '1.1 MB', updatedAt: '2024-03-18' },
  ],
  users: [
    { id: 1, username: 'alice_wang', displayName: 'Alice Wang', role: 'Student' },
    { id: 2, username: 'prof_chen', displayName: 'Prof. Chen', role: 'Instructor' },
  ],
};

const RESULT_ICONS = {
  notes: <FileTextOutlined />,
  courses: <BookOutlined />,
  files: <FolderOutlined />,
  users: <UserOutlined />,
};

function GlobalSearchPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { query, results, activeTab, history, loading } = useSelector((state) => state.search);
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');

  const doSearch = async (q) => {
    if (!q.trim()) return;
    dispatch(setQuery(q.trim()));
    dispatch(addToHistory(q.trim()));
    dispatch(setLoading(true));
    setSearchParams({ q: q.trim() });
    try {
      const res = await globalSearch(q.trim(), { sortBy });
      dispatch(setResults(res.data));
    } catch {
      // Use mock data in development
      dispatch(setResults(MOCK_RESULTS));
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setInputValue(q);
      doSearch(q);
    }
  }, []);

  const handleSearch = () => doSearch(inputValue);

  const handleHistoryClick = (item) => {
    setInputValue(item);
    doSearch(item);
  };

  const getTabResults = () => {
    if (!results || typeof results !== 'object') return [];
    if (activeTab === 'all') {
      return [
        ...(results.notes || []).map((r) => ({ ...r, _type: 'notes' })),
        ...(results.courses || []).map((r) => ({ ...r, _type: 'courses' })),
        ...(results.files || []).map((r) => ({ ...r, _type: 'files' })),
        ...(results.users || []).map((r) => ({ ...r, _type: 'users' })),
      ];
    }
    return (results[activeTab] || []).map((r) => ({ ...r, _type: activeTab }));
  };

  const tabResults = getTabResults();
  const hasResults = Object.keys(results || {}).length > 0;

  const tabItems = [
    { key: 'all', label: `${t('search.all')} (${tabResults.length || 0})` },
    { key: 'notes', label: t('search.notes') },
    { key: 'courses', label: t('search.courses') },
    { key: 'files', label: t('search.files') },
    { key: 'users', label: t('search.users') },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <Input.Search
            size="large"
            prefix={<SearchOutlined />}
            placeholder={t('search.placeholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={handleSearch}
            enterButton={t('common.search')}
            allowClear
          />
        </div>

        {/* Recent searches (shown when no query) */}
        {!query && history.length > 0 && (
          <Card
            size="small"
            title={t('search.recentSearches')}
            style={{ marginBottom: 24, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => dispatch(clearHistory())}
              >
                {t('search.clearHistory')}
              </Button>
            }
          >
            <Space wrap>
              {history.map((item) => (
                <Tag
                  key={item}
                  icon={<HistoryOutlined />}
                  closable
                  style={{ cursor: 'pointer', fontSize: 13 }}
                  onClick={() => handleHistoryClick(item)}
                  onClose={() => dispatch(removeFromHistory(item))}
                >
                  {item}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Results */}
        {query && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                {t('search.results')}: "{query}"
              </Title>
              <Select
                size="small"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'relevance', label: t('search.relevance') },
                  { value: 'latest', label: t('search.latest') },
                  { value: 'oldest', label: t('search.oldest') },
                ]}
              />
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={(key) => dispatch(setActiveTab(key))}
              items={tabItems}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin size="large" />
              </div>
            ) : tabResults.length === 0 ? (
              <Empty description={t('search.noResults')} style={{ padding: 48 }} />
            ) : (
              <List
                dataSource={tabResults}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      background: 'var(--bg-primary)',
                      borderRadius: 8,
                      marginBottom: 8,
                      padding: '12px 16px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={RESULT_ICONS[item._type]}
                          style={{ background: '#e6f4ff', color: '#1677ff' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong style={{ color: 'var(--text-primary)' }}>
                            {item.title || item.name || item.displayName}
                          </Text>
                          <Tag>{item._type}</Tag>
                        </Space>
                      }
                      description={
                        <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {item.content || item.instructor || item.role || item.size || ''}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default GlobalSearchPage;
