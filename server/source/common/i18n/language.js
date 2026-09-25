import fs from 'node:fs/promises';
import path from 'node:path';
import { ApiLanguageEnum } from '../_index.js';

const fileArPath = path.resolve('source', 'common', 'i18n', 'arabic.json');
const fileEnPath = path.resolve('source', 'common', 'i18n', 'english.json');

export const chooseLanguage =  ({ Language = 0, code } = {}) => {
    let message;
    switch (Language) {
        case ApiLanguageEnum.ENGLISH:
            message =  EnglishLanguage[`${code}`]
            break;
        case ApiLanguageEnum.ARABIC:
            message =  ArabicLanguage[`${code}`]
            break;
        default:
            break;
    }
    return message
}

export const ArabicLanguage = JSON.parse(await fs.readFile(fileArPath, 'utf-8'));
export const EnglishLanguage = JSON.parse(await fs.readFile(fileEnPath, 'utf-8'));
