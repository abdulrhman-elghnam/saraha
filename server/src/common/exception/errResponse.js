export const ErrorResponse = ({
  message = 'Error',
  messageCode,
  status = 400,
  extra = undefined,
} = {}) => {
  throw new Error(message, {
    cause: {
      status,
      messageCode,
      extra,
    },
  });
};
