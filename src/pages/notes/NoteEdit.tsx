import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Switch, message, Tabs } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import request from '@/utils/request';

const { TextArea } = Input;
const { Option } = Select;

const NoteEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (isEdit) {
      fetchNoteDetail();
    }
  }, [id]);

  const fetchNoteDetail = async () => {
    try {
      setLoading(true);
      const res: any = await request.get(`/api/notes/${id}`);
      const data = res.data || res;
      form.setFieldsValue(data);
      setContent(data.content || '');
    } catch (error) {
      console.error('Failed to fetch note detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      if (isEdit) {
        await request.put(`/api/notes/${id}`, values);
        message.success('笔记更新成功');
      } else {
        await request.post('/api/notes', values);
        message.success('笔记创建成功');
      }
      navigate('/notes');
    } catch (error) {
      // 错误拦截器已处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑笔记' : '新建笔记'} bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'DRAFT', isPublic: false }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入笔记标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item
          name="category"
          label="分类"
        >
          <Input placeholder="例如: 前端开发, 数据库" />
        </Form.Item>

        <Form.Item
          name="tags"
          label="标签"
        >
          <Input placeholder="用逗号分隔，如: React, Hooks" />
        </Form.Item>

        <Form.Item
          name="description"
          label="摘要"
        >
          <TextArea rows={2} placeholder="简短描述..." />
        </Form.Item>

        <Form.Item
          label="内容 (支持 Markdown)"
          required
        >
          <Tabs
            defaultActiveKey="edit"
            items={[
              {
                key: 'edit',
                label: '编辑',
                children: (
                  <Form.Item
                    name="content"
                    noStyle
                    rules={[{ required: true, message: '请输入笔记内容' }]}
                  >
                    <TextArea 
                      rows={15} 
                      placeholder="在这里使用 Markdown 编写你的笔记..." 
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <Card type="inner" style={{ minHeight: 350, maxHeight: 500, overflowY: 'auto' }}>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content || '*暂无内容*'}
                      </ReactMarkdown>
                    </div>
                  </Card>
                ),
              },
            ]}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
            <Select style={{ width: 120 }}>
              <Option value="DRAFT">草稿</Option>
              <Option value="PUBLISHED">发布</Option>
              <Option value="ARCHIVED">归档</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isPublic" label="公开分享" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch />
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 16 }}>
            {isEdit ? '保存更新' : '创建笔记'}
          </Button>
          <Button onClick={() => navigate('/notes')}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NoteEdit;