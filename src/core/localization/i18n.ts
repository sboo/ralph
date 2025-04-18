
import i18next from 'i18next';
import RNLanguageDetector from './LanguageDetector';
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
    name: 'English',
  },
  {
    langCode: 'es',
    isoCode: 'es',
    name: 'Castellano',
  },
  {
    langCode: 'de',
    isoCode: 'de',
    name: 'Deutsch',
  },
  {
    langCode: 'nl',
    isoCode: 'nl',
    name: 'Nederlands',
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

i18next.use(RNLanguageDetector).use(initReactI18next).init({
  compatibilityJSON: 'v4',
  debug: true,
  fallbackLng: 'en',
  defaultNS,
  resources,
});

export default i18next;
