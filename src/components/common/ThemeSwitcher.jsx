import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';
import { THEMES } from '../../theme/themes';
import { setTheme } from '../../store/slices/settingsSlice';

const THEME_ICONS = {
  [THEMES.LIGHT]: <SunOutlined />,
  [THEMES.DARK]: <MoonOutlined />,
  [THEMES.AUTO]: <DesktopOutlined />,
};

function ThemeSwitcher() {
  const { t } = useTranslation();
  const { themeMode, switchTheme } = useTheme();
  const dispatch = useDispatch();

  const handleChange = (mode) => {
    switchTheme(mode);
    dispatch(setTheme(mode));
  };

  const items = [
    {
      key: THEMES.LIGHT,
      icon: <SunOutlined />,
      label: t('theme.light'),
      onClick: () => handleChange(THEMES.LIGHT),
    },
    {
      key: THEMES.DARK,
      icon: <MoonOutlined />,
      label: t('theme.dark'),
      onClick: () => handleChange(THEMES.DARK),
    },
    {
      key: THEMES.AUTO,
      icon: <DesktopOutlined />,
      label: t('theme.auto'),
      onClick: () => handleChange(THEMES.AUTO),
    },
  ];

  return (
    <Dropdown menu={{ items, selectedKeys: [themeMode] }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        icon={THEME_ICONS[themeMode] || <SunOutlined />}
        style={{ color: '#fff', fontSize: 18, padding: '4px 8px' }}
        title={t('theme.switchTheme')}
      />
    </Dropdown>
  );
}

export default ThemeSwitcher;
