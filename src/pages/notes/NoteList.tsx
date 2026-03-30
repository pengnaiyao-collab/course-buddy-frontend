import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space, Typography, Input } from 'antd';
import { PlusOutlined, EditOutlined, ShareAltOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string;
  status: string;
  isPublic: boolean;
  updatedAt: string;
}

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setKeyword] = useState('');
  const navigate = useNavigate();

  const fetchNotes = async (searchKeyword = '') => {
    try {
      setLoading(true);
      const url = searchKeyword 
        ? `/api/notes/search?keyword=${encodeURIComponent(searchKeyword)}` 
        : '/api/notes';
      const res: any = await request.get(url);
      setNotes(res.data?.content || res.content || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchNotes(value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>我的笔记</Title>
        <Space>
          <Search 
            placeholder="搜索笔记..." 
            onSearch={handleSearch} 
            style={{ width: 250 }} 
            allowClear 
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/notes/create')}>
            新建笔记
          </Button>
          <Button onClick={() => navigate('/notes/ocr')}>
            OCR 识别
          </Button>
        </Space>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
        dataSource={notes}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <EditOutlined key="edit" onClick={() => navigate(`/notes/edit/${item.id}`)} />,
                <ShareAltOutlined key="share" />,
                <DownloadOutlined key="download" />,
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ height: 44, marginBottom: 8 }}>
                      {item.description || '暂无描述'}
                    </Paragraph>
                    <Space wrap size={[0, 8]}>
                      {item.category && <Tag color="cyan">{item.category}</Tag>}
                      {item.status && (
                        <Tag color={item.status === 'PUBLISHED' ? 'green' : 'default'}>
                          {item.status}
                        </Tag>
                      )}
                      {item.isPublic && <Tag color="blue">公开</Tag>}
                    </Space>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                      更新于: {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NoteList;