import fs from 'node:fs/promises';
import path from 'node:path';
import { ApiLanguageEnum } from '../_index.js';

const fileArPath = path.resolve('source', 'common', 'i18n', 'arabic.json');
const fileEnPath = path.resolve('source', 'common', 'i18n', 'english.json');

export const chooseLanguage = ({ Language = ApiLanguageEnum.ENGLISH, code } = {}) => {
  const normalizedLanguage = String(Language)
    .toLowerCase()
    .split(',')[0]
    .split('-')[0]
    .trim();
  let messages;

  switch (normalizedLanguage) {
    case String(ApiLanguageEnum.ARABIC):
    case 'ar':
      messages = ArabicLanguage;
      break;
    case String(ApiLanguageEnum.ENGLISH):
    case 'en':
    default:
      messages = EnglishLanguage;
      break;
  }
  return messages[`${code}`] ?? EnglishLanguage[`${code}`];
};

export const ArabicLanguage = JSON.parse(await fs.readFile(fileArPath, 'utf-8'));
export const EnglishLanguage = JSON.parse(await fs.readFile(fileEnPath, 'utf-8'));
