import { randomUUID } from 'node:crypto';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { mkdir, rename, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { fileTypeFromFile } from 'file-type';
import multer from 'multer';
import { fileFilter, normalizeMimeType } from './multerValidation.js';

export const LOCAL_UPLOAD_DIRECTORY = fileURLToPath(
  new URL('../../../public/assets/', import.meta.url),
);

export const localFileUpload = ({
  customPath = 'general',
  validation = [],
  maxSize = 10,
} = {}) => {
  if (typeof customPath !== 'string' || isAbsolute(customPath)) {
    throw new TypeError('customPath must be a relative path inside public/assets');
  }

  const destinationPath = resolve(LOCAL_UPLOAD_DIRECTORY, customPath);
  const relativeDestination = relative(LOCAL_UPLOAD_DIRECTORY, destinationPath);
  if (relativeDestination.startsWith(`..${sep}`) || relativeDestination === '..') {
    throw new TypeError('customPath must stay inside public/assets');
  }

  const publicPath = relativeDestination.split(sep).filter(Boolean).map(encodeURIComponent);
  const storage = {
    _handleFile(req, file, callback) {
      const temporaryPath = resolve(destinationPath, `.${randomUUID()}.upload`);
      let size = 0;

      const saveAndValidate = async () => {
        await mkdir(destinationPath, { recursive: true });
        const countBytes = new Transform({
          transform(chunk, encoding, callback) {
            size += chunk.length;
            callback(null, chunk);
          },
        });
        await pipeline(
          file.stream,
          countBytes,
          createWriteStream(temporaryPath, { flags: 'wx' }),
        );

        const detectedType = await fileTypeFromFile(temporaryPath);
        const allowedTypes = validation.map(normalizeMimeType);
        const declaredMimeType = normalizeMimeType(file.mimetype);

        if (
          !detectedType ||
          !allowedTypes.includes(detectedType.mime) ||
          detectedType.mime !== declaredMimeType
        ) {
          throw new Error('Unsupported file type', {
            cause: { status: 400, messageCode: 603 },
          });
        }

        const filename = `${randomUUID()}.${detectedType.ext}`;
        const filePath = resolve(destinationPath, filename);
        await rename(temporaryPath, filePath);

        const finalPath = `/assets/${[...publicPath, filename].join('/')}`;
        file.finalPath = finalPath;
        file.detectedMimeType = detectedType.mime;

        return {
          destination: destinationPath,
          filename,
          path: filePath,
          size,
          finalPath,
          detectedMimeType: detectedType.mime,
        };
      };

      saveAndValidate().then(
        (info) => callback(null, info),
        async (error) => {
          try {
            await rm(temporaryPath, { force: true });
            callback(error);
          } catch (cleanupError) {
            callback(new AggregateError([error, cleanupError], 'Upload validation and cleanup failed'));
          }
        },
      );
    },
    _removeFile(req, file, callback) {
      rm(file.path, { force: true }).then(() => callback(null), callback);
    },
  };

  return multer({
    fileFilter: fileFilter(validation),
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};