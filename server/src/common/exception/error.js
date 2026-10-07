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

export const BadRequestException = ({
  message = 'Bad request',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 400,
    extra,
  });
};

export const TooManyRequestsException = ({
  message = 'Too many requests',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 429,
    extra,
  });
};

export const UnauthorizedException = ({
  message = 'Unauthorized',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 401,
    extra,
  });
};

export const ForbiddenException = ({
  message = 'Forbidden',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 403,
    extra,
  });
};

export const NotFoundException = ({
  message = 'Resource not found',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 404,
    extra,
  });
};

export const ConflictException = ({
  message = 'Conflict',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 409,
    extra,
  });
};

export const UnprocessableEntityException = ({
  message = 'Unprocessable entity',
  messageCode,
  extra = undefined,
} = {}) => {
  return ErrorResponse({
    message,
    messageCode,
    status: 422,
    extra,
  });
};
