import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en_US.json';
import zhCN from './locales/zh_CN.json';

const LANGUAGE_KEY = 'courseBuddy_language';

const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
const browserLanguage = navigator.language || navigator.userLanguage;
const defaultLanguage = savedLanguage || (browserLanguage.startsWith('zh') ? 'zh_CN' : 'en_US');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en_US: { translation: enUS },
      zh_CN: { translation: zhCN },
    },
    lng: defaultLanguage,
    fallbackLng: 'en_US',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem(LANGUAGE_KEY, lang);
};

export const getSupportedLanguages = () => [
  { code: 'en_US', label: 'English', nativeLabel: 'English' },
  { code: 'zh_CN', label: 'Chinese', nativeLabel: '中文' },
];

export default i18n;
