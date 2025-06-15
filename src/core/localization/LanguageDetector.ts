import * as Localization from 'expo-localization';
import { type LanguageDetectorModule } from 'i18next';


const defaultLang = 'en';

const RNLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  init: () => { },
  detect: () => {
    const supportedLanguages = ['en', 'es', 'nl', 'de'];

    const locales = Localization.getLocales();
    const deviceLocale = locales && locales.length > 0 ? locales[0] : undefined;
    const languageCode = deviceLocale?.languageCode || defaultLang;

    console.log('languageCode', languageCode );

    if (supportedLanguages.includes(languageCode)) {
      return languageCode;
    }
    console.warn(`locale ${languageCode} is not supported, defaulting to ${defaultLang}`);
    return defaultLang;
  },
  cacheUserLanguage: () => { },
};

export default RNLanguageDetector;