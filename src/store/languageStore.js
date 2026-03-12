import { create } from 'zustand';
import { t } from '../i18n';

const getStoredLang = () => {
  try {
    return localStorage.getItem('squadup-lang') || 'en';
  } catch {
    return 'en';
  }
};

const useLanguageStore = create((set, get) => ({
  lang: getStoredLang(),

  setLang: (lang) => {
    localStorage.setItem('squadup-lang', lang);
    set({ lang });
  },

  t: (key, params) => t(get().lang, key, params),
}));

export default useLanguageStore;
