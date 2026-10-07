import fs from 'node:fs/promises';
import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

const ALLOWED_IMAGES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
]);

const getUploadedFiles = (req) => {
  if (req.file) {
    return [req.file];
  }

  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }

  return [];
};

const deleteFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.unlink(file.path);
  } catch(error) {
    console.log(`Failed to delete file: ${file.path}`);
    console.error(error);
  }
};

const deleteFiles = async (files) => {
  await Promise.all(files.map(deleteFile));
};

const getExtension = (filename = '') => {
  return path.extname(filename).slice(1).toLowerCase();
};

const verifyImage = async (file) => {
  const buffer = await fs.readFile(file.path);

  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType) {
    return {
      valid: false,
      reason: 'Unable to determine file type.',
    };
  }

  if (!ALLOWED_IMAGES.has(detectedType.mime)) {
    return {
      valid: false,
      reason: `File type "${detectedType.mime}" is not allowed.`,
    };
  }
 const originalExtension = getExtension(file.originalname);

  const expectedExtension = ALLOWED_IMAGES.get(
    detectedType.mime
  );

  if (originalExtension !== expectedExtension) {
    return {
      valid: false,
      reason: 'File extension does not match the actual file type.',
    };
  }


  if (
    file.mimetype &&
    file.mimetype !== detectedType.mime
  ) {
    return {
      valid: false,
      reason: 'Declared MIME type does not match the actual file type.',
    };
  }

  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        reason: 'Invalid image dimensions.',
      };
    }

    if (
      metadata.width > 10000 ||
      metadata.height > 10000
    ) {
      return {
        valid: false,
        reason: 'Image dimensions are too large.',
      };
    }
  } catch {
    return {
      valid: false,
      reason: 'Corrupted or invalid image file.',
    };
  }

  return {
    valid: true,
    mime: detectedType.mime,
    extension: detectedType.ext,
  };
};

export const verifyRealFileType = async (req, res, next) => {
  const files = getUploadedFiles(req);

  if (!files.length) {
    return next();
  }

  try {
    for (const file of files) {
      const result = await verifyImage(file);

      if (!result.valid) {
        await deleteFiles(files);

        return res.status(400).json({
          success: false,
          error: 'Invalid file.',
          reason: result.reason,
          file: file.originalname,
        });
      }
    }

    next();
  } catch (error) {
    await deleteFiles(files);

    return res.status(500).json({
      success: false,
      error: 'Internal server validation error.',
    });
  }
};