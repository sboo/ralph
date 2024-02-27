import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import en from './en';
import es from './es';

const resources = {
  en,
  es,
};

const defaultNS = 'common';

i18next.use(initReactI18next).use(RNLanguageDetector).init({
  compatibilityJSON: 'v3',
  debug: true,
  fallbackLng: 'en',
  defaultNS,
  resources,
});

export default i18next;
