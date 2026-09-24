import fs from 'node:fs/promises';
import path from 'node:path';

const fileArPath = path.resolve('source', 'common', 'i18n', 'ar.json');
const fileEnPath = path.resolve('source', 'common', 'i18n', 'en.json');

export const ArabicLanguage = JSON.parse(await fs.readFile(fileArPath, 'utf-8'));
export const EnglishLanguage = JSON.parse(await fs.readFile(fileEnPath, 'utf-8'));
