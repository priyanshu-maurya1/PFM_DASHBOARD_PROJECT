import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations, getTranslation } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  // Initialize from localStorage or default to English
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gj_language');
      if (stored !== null) {
        setLanguage(stored);
        return;
      }
    } catch (e) {}

    // Default to English if nothing stored
    setLanguage("en");
  }, []);

  // Persist language choice to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gj_language', language);
    } catch (e) {
      /* ignore */
    }
  }, [language]);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  // Translation function - returns translated string for a given key
  const t = useCallback((key) => {
    return getTranslation(language, key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Available languages with their codes and display names
export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
];

export default LanguageContext;

