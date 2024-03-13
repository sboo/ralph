import i18next from 'i18next';
import {ReactNativeLanguageDetector} from 'react-native-localization-settings';
import en from './en';
import es from './es';
import {initReactI18next} from 'react-i18next';

export const AVAILABLE_LANGUAGES = [
  {
    langCode: 'en',
    isoCode: 'gb',
  },
  {
    langCode: 'es',
    isoCode: 'es',
  },
];

const resources = {
  en,
  es,
};

const defaultNS = 'common';

i18next.use(ReactNativeLanguageDetector).use(initReactI18next).init({
  compatibilityJSON: 'v3',
  debug: true,
  fallbackLng: 'en',
  defaultNS,
  resources,
});

export default i18next;
