import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import { extname, resolve } from 'node:path';
import { BadRequestException } from '../exception/exceptionErr.js';

export const fileFieldValidation = {
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  video: ['video/mp4'],
};

export const localFileUpload = ({
  maxFileSize = 5,
  validation = [],
  customPath = 'general',
} = {}) => {
  const destination = `./assets/${customPath}`;

  const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      try {
        await mkdir(resolve(destination), { recursive: true });
        cb(null, destination);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  });

  function fileFilter(req, file, cb) {
    if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid format', { cause: { status: 400, messageCode: 603 } }), false);
    }
  }

  return multer({ fileFilter, storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};

export const processFile = async ({ customPath = 'general', file, validation = [] }) => {
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    throw BadRequestException({ messageCode: 603 });
  } else {
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;
    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
    file.path = uniqueFilePath;
    return file;
  }
};

export const processFiles = async ({ customPath, files = [], validation = [] }) => {
  const assets = [];
  for (const file of files) {
    const uploadFile = await processFile({ customPath, file, validation });
    assets.push(uploadFile);
  }
  return assets;
};

export const processFields = async ({ customPath, fields = {}, validation = [] }) => {
  const assets = [];
  for (const field of Object.keys(fields)) {
    const files = await processFiles({ customPath, files: fields[field], validation });
    assets.push({ field, files });
  }

  return assets;
};

export const processMulterUpload = ({ customPath = 'general', validation = [] }) => {
  return async (req, res, next) => {
    console.log(req.files);

    if (req.file) {
      await processFile({ customPath, file: req.file, validation });
    } else if (Array.isArray(req.files)) {
      await processFiles({ customPath, files: req.files, validation });
    } else if (typeof req.files == 'object' && Object.keys(req.files)?.length) {
      await processFields({ customPath, fields: req.files, validation });
    }
    next();
  };
};
