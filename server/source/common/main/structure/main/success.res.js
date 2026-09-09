export const sendSuccess = ({
  res,
  message = 'Success',
  data = undefined,
  statusCode = 200,
} = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
