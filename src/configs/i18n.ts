import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import contentVn from '@/content/vn.json';

i18n.use(initReactI18next).init({
  resources: {
    vn: { translation: contentVn },
  },
  lng: 'vn',
  fallbackLng: 'vn',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
