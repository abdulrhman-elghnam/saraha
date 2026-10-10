export const fileFieldValidation = {
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  video: ['video/mp4'],
};

export const normalizeMimeType = (mimeType) =>
  mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

export const fileFilter = (validation = []) => {
  return function (req, file, callback) {
    if (!validation.map(normalizeMimeType).includes(normalizeMimeType(file.mimetype))) {
      return callback(
        new Error('Unsupported file type', {
          cause: { status: 400, messageCode: 603 },
        }),
      );
    }

    return callback(null, true);
  };
};