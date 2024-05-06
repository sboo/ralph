
import i18next from 'i18next';
import {ReactNativeLanguageDetector} from 'react-native-localization-settings';
import en from './en';
import es from './es';
import de from './de';
import nl from './nl';
import {initReactI18next} from 'react-i18next';
import {LocaleConfig} from 'react-native-calendars';

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

LocaleConfig.locales.en = en.calendar;
LocaleConfig.locales.de = de.calendar;
LocaleConfig.locales.es = es.calendar;
LocaleConfig.locales.nl = nl.calendar;

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
