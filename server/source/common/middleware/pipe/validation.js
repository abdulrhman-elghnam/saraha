export const validationPipe = (schema) => {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    request.body = result.data;
    next();
  };
};

export const globalValidationField = () => {

}
