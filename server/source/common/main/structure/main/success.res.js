export const sendSuccess = ({
  response,
  message = 'Success',
  data = undefined,
  statusCode = 200,
} = {}) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
