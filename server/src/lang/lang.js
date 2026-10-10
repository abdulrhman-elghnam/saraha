import fs from 'node:fs/promises';
import { ApiLanguageEnum } from '../common/value/_INDEX.js';

const getLanguage = (lang) => new URL(`${lang}.json`, import.meta.url);

export const ArabicLanguage = JSON.parse(await fs.readFile(getLanguage('ar'), 'utf-8'));
export const EnglishLanguage = JSON.parse(await fs.readFile(getLanguage('en'), 'utf-8'));

export const chooseLanguage = ({ lang = ApiLanguageEnum.ENGLISH, code } = {}) => {
  const normalizedLanguage = String(lang)
    .split(',')[0]
    .split(';')[0]
    .trim()
    .split(/[-_]/, 1)[0]
    .toUpperCase();
  let messages;

  switch (normalizedLanguage) {
    case String(ApiLanguageEnum.ARABIC):
      messages = ArabicLanguage;
      break;
    case String(ApiLanguageEnum.ENGLISH):
    default:
      messages = EnglishLanguage;
      break;
  }
  return messages[`${code}`] ?? EnglishLanguage[`${code}`] ?? EnglishLanguage['103'];
};
