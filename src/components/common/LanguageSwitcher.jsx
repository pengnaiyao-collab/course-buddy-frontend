import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import { GlobalOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { changeLanguage, getSupportedLanguages } from '../../i18n/i18n';
import { setLanguage } from '../../store/slices/settingsSlice';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const currentLang = i18n.language;

  const handleChange = (lang) => {
    changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  const languages = getSupportedLanguages();

  const items = languages.map((lang) => ({
    key: lang.code,
    icon: currentLang === lang.code ? <CheckOutlined style={{ color: '#1677ff' }} /> : null,
    label: lang.nativeLabel,
    onClick: () => handleChange(lang.code),
  }));

  const currentLabel = languages.find((l) => l.code === currentLang)?.nativeLabel || 'EN';

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        style={{ color: '#fff', padding: '4px 8px' }}
      >
        <Space size={4}>
          <GlobalOutlined style={{ fontSize: 16 }} />
          <span style={{ fontSize: 12 }}>{currentLabel}</span>
        </Space>
      </Button>
    </Dropdown>
  );
}

export default LanguageSwitcher;
