import React, { useState, useRef, useEffect } from 'react';
import { Input, List, Tag, Button, Typography, Space } from 'antd';
import { SearchOutlined, HistoryOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setQuery, addToHistory } from '../../store/slices/searchSlice';

const { Text } = Typography;

function SearchBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { history } = useSelector((state) => state.search);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (val) => {
    const query = val || value;
    if (!query.trim()) return;
    dispatch(setQuery(query.trim()));
    dispatch(addToHistory(query.trim()));
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    setValue('');
  };

  const showDropdown = focused && history.length > 0 && !value;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 260 }}>
      <Input
        prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
        placeholder={t('search.placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onPressEnter={() => handleSearch()}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 6,
          color: '#fff',
          width: '100%',
        }}
        styles={{ input: { color: '#fff', background: 'transparent' } }}
        allowClear={{ clearIcon: <CloseCircleOutlined style={{ color: 'rgba(255,255,255,0.7)' }} /> }}
      />
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '8px 0',
          }}
        >
          <div style={{ padding: '4px 12px 8px', borderBottom: '1px solid var(--border-color)' }}>
            <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {t('search.recentSearches')}
            </Text>
          </div>
          {history.slice(0, 5).map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                cursor: 'pointer',
                gap: 8,
              }}
              onMouseDown={() => handleSearch(item)}
            >
              <HistoryOutlined style={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              <Text style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
