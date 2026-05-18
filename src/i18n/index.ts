import tr from './tr.json';
import en from './en.json';

type Translations = typeof tr;
type TranslationKey = keyof Translations;

const translations: Record<string, Translations> = { tr, en };

export const t = (lang: string, key: TranslationKey, vars?: Record<string, string | number>): string => {
  let text: string = (translations[lang]?.[key] ?? translations['tr'][key] ?? key) as string;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
};
