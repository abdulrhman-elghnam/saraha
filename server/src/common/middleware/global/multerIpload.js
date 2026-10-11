import { processMulterUpload } from "#/common/_EXPORT.js";
export const uploadMiddleware = ({
  multerMiddleware,
  customPath = 'general',
  validation = [],
  isRequired = true,
}) => {
  return (req, res, next) => {
    try {
      multerMiddleware(req, res, async (error) => {
        if (error) {
          return next(new Error(error.message, { cause: { status: 400 } }));
        }

        const hasUploadedFile = Boolean(req.file || req.files);
        if (isRequired && !hasUploadedFile) {
          return next(
            new Error('File is required', {
              cause: { status: 400, messageCode: 602 },
            }),
          );
        }

        if (typeof processMulterUpload === 'function') {
          await processMulterUpload({ customPath, validation, req });
        }

        return next();
      });
    } catch (error) {
      return next(error);
    }
  };
};