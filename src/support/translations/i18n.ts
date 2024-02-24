import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enDefault from './en/en.json';
import esDefault from './es/es.json';

export const defaultNS = 'default';

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  debug: true,
  fallbackLng: 'en',
  defaultNS,
  resources: {
    en: {
      default: enDefault,
    },
    es: {
      default: esDefault,
    },
  },
});

export default i18next;
