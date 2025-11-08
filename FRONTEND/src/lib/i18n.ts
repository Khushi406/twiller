import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'hi', 'pt', 'zh'],
    load: 'languageOnly', // This will load 'en' for 'en-US', 'en-IN', etc.
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/common.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        // Convert language codes like 'en-US', 'en-IN' to just 'en'
        if (lng) {
          const languageCode = lng.split('-')[0];
          // Make sure it's a supported language, otherwise fallback to 'en'
          const supported = ['en', 'es', 'fr', 'hi', 'pt', 'zh'];
          return supported.includes(languageCode) ? languageCode : 'en';
        }
        return 'en';
      }
    },
  })

export default i18n
