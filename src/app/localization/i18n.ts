import i18next from 'i18next';
import {ReactNativeLanguageDetector} from 'react-native-localization-settings';
import en from './en';
import es from './es';
import de from './de';
import nl from './nl';
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
  {
    langCode: 'de',
    isoCode: 'de',
  },
  {
    langCode: 'nl',
    isoCode: 'nl',
  },
];

const resources = {
  en,
  es,
  de,
  nl,
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
