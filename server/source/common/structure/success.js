export const sendSuccess = ({
  response,
  message = 'Success',
  data = undefined,
  statusCode = 200,
  ...extra 
} = {}) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};
