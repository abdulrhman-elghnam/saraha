import fs from 'node:fs/promises';
import path from 'node:path';
import { ApiLanguageEnum } from '../value/enum.js';

const getLanguage = async (lang) => {
  return path.resolve('src', 'common', 'lang', `${lang}.json`);
};

export const ArabicLanguage = JSON.parse(await fs.readFile(await getLanguage('ar'), 'utf-8'));
export const EnglishLanguage = JSON.parse(await fs.readFile(await getLanguage('en'), 'utf-8'));

export const chooseLanguage = ({ lang = ApiLanguageEnum.ENGLISH, code } = {}) => {
  const normalizedLanguage = String(lang).toLowerCase().split(',')[0].split('-')[0].trim();
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
