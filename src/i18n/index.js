import en from './en';
import pt from './pt';

const translations = { en, pt };

export const getTranslation = (lang) => translations[lang] || translations.en;

export const t = (lang, key, params = {}) => {
  const trans = translations[lang] || translations.en;
  let text = trans[key] || translations.en[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
};

export default translations;
