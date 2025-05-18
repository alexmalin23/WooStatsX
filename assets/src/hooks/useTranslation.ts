import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect } from 'react';
import i18n from '../i18n';

/**
 * Custom hook for translations that also checks for WordPress locale changes
 */
export const useTranslation = () => {
  const { t, i18n: i18nInstance } = useI18nTranslation();
  
  useEffect(() => {
    // Function to check if WordPress locale has changed
    const checkWordPressLocale = () => {
      if (typeof window !== 'undefined' && window.wooStatsx && window.wooStatsx.locale) {
        const wpLocale = window.wooStatsx.locale.split('_')[0]; // Convert 'he_IL' to 'he'
        
        // Only change language if it's different from current
        if (wpLocale && i18nInstance.language !== wpLocale) {
          i18nInstance.changeLanguage(wpLocale);
        }
      }
    };
    
    // Check on mount
    checkWordPressLocale();
    
    // Set up event listener for potential language changes
    window.addEventListener('wooStatsx:localeChanged', checkWordPressLocale);
    
    return () => {
      window.removeEventListener('wooStatsx:localeChanged', checkWordPressLocale);
    };
  }, [i18nInstance]);
  
  // Function to get the current language direction
  const getDirection = () => {
    return i18nInstance.language === 'he' ? 'rtl' : 'ltr';
  };
  
  return { 
    t, 
    i18n: i18nInstance,
    dir: getDirection()
  };
}; 