import { type LanguageDetectorModule } from 'i18next';
import { getLocales } from 'react-native-localize';


const defaultLang = 'en';

const RNLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  init: () => { },
  detect: () => {
    const supportedLanguages = ['en', 'es', 'nl', 'de'];

    const languageCode = getLocales()[0].languageCode;

    console.log('languageCode', languageCode);

    if (supportedLanguages.includes(languageCode)) {
      return languageCode;
    }
    console.warn(`locale ${languageCode} is not supported, defaulting to ${defaultLang}`);
    return defaultLang;
  },
  cacheUserLanguage: () => { },
};

export default RNLanguageDetector;