import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import heTranslation from './locales/he/translation.json';

// Get WordPress locale from global window object if available
const getWordPressLocale = (): string => {
  if (typeof window !== 'undefined' && window.wooStatsx && window.wooStatsx.locale) {
    // Get WP locale and convert it to i18next format (e.g., 'he_IL' to 'he')
    return window.wooStatsx.locale.split('_')[0];
  }
  return 'he'; // Default to Hebrew if not specified
};

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      he: {
        translation: heTranslation,
      },
    },
    lng: getWordPressLocale(),
    fallbackLng: 'he', // Default to Hebrew if the translation isn't available
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    react: {
      useSuspense: true,
    },
    detection: {
      order: ['htmlTag', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n; 