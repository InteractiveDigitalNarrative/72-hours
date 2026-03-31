import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import en from '../i18n/en.json';

// Lazy-load translation files so only the active language is imported at startup
const translations = { en };

let etCache = null;
function getEt() {
  if (!etCache) {
    // Dynamic import is not usable synchronously, so we bundle et.json eagerly
    // but only resolve it on first access.
    try {
      etCache = require('../i18n/et.json');
    } catch {
      etCache = null;
    }
  }
  return etCache;
}

// For Vite, use eager import.meta.glob instead of require
const etModule = import.meta.glob('../i18n/et.json', { eager: true, import: 'default' });
const etData = Object.values(etModule)[0] ?? null;

/**
 * Interpolate {{key}} placeholders in a string.
 *   t('Hello {{name}}', { name: 'World' }) → 'Hello World'
 */
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? vars[key] : `{{${key}}}`));
}

/**
 * Resolve a dot-path on an object: resolve(obj, 'a.b.c') → obj.a.b.c
 */
function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * React hook that returns a translation function `t(key, vars?)`.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t('menu.title')                      → "STORM ALERT"
 *   t('waterCalc.screen1Text', { people: 3 }) → interpolated string
 *
 * Falls back to English if the key is missing in the active language.
 */
export function useTranslation() {
  const { language } = useLanguage();

  const dict = useMemo(() => {
    if (language === 'et' && etData) return etData;
    return en;
  }, [language]);

  const t = useMemo(() => {
    return (key, vars) => {
      let val = resolve(dict, key);
      // Fallback to English
      if (val === undefined) val = resolve(en, key);
      if (val === undefined) return key; // last resort: return the key itself
      if (typeof val === 'string') return interpolate(val, vars);
      return val; // arrays, objects — return as-is
    };
  }, [dict]);

  return { t, language };
}
