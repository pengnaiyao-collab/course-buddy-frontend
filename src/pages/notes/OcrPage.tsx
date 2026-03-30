import React, { useState } from 'react';
import { Card, Upload, Button, message, Spin, Typography, Space, Divider } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const { Dragger } = Upload;
const { Title } = Typography;

const OcrPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      setLoading(true);
      setOcrResult(null);

      const formData = new FormData();
      formData.append('file', file);
      // 可选参数
      formData.append('language', 'chi_sim+eng');
      formData.append('autoArchive', 'false'); // 仅做演示，暂不自动归档为知识点

      const res: any = await request.post('/api/v1/ocr/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setOcrResult(res.data || res);
      message.success('OCR 识别成功！');
      onSuccess(res);
    } catch (error) {
      console.error('OCR failed:', error);
      message.error('OCR 识别失败，请检查服务是否可用');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const createNoteFromResult = () => {
    if (!ocrResult?.extractedText) return;
    // 简单地把结果存在 localStorage 然后跳转，或者直接跳到创建页面
    localStorage.setItem('tempOcrContent', ocrResult.extractedText);
    message.success('已复制到剪贴板，前往创建笔记');
    // 在实际项目中最好使用状态管理或URL参数传递
  };

  return (
    <Card title="图片文字识别 (OCR)">
      <div style={{ marginBottom: 24 }}>
        <Dragger
          name="file"
          multiple={false}
          accept="image/*"
          customRequest={customRequest}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域进行识别</p>
          <p className="ant-upload-hint">
            支持 JPG, PNG, JPEG 格式，用于识别课堂板书、幻灯片或教材截图。
          </p>
        </Dragger>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="正在通过 Tesseract 引擎识别图片内容..." />
        </div>
      )}

      {ocrResult && (
        <div>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>识别结果</Title>
            <Space>
              <Button 
                type="primary" 
                icon={<FileTextOutlined />} 
                onClick={createNoteFromResult}
              >
                转换为笔记
              </Button>
            </Space>
          </div>
          
          <Card type="inner" style={{ background: '#f5f5f5', whiteSpace: 'pre-wrap' }}>
            {ocrResult.extractedText || '未识别到任何文本'}
          </Card>

          {ocrResult.structuredSummary && (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>AI 结构化摘要</Title>
              <Card type="inner" style={{ whiteSpace: 'pre-wrap' }}>
                {ocrResult.structuredSummary}
              </Card>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default OcrPage;