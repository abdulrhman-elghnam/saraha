import { BadRequestException } from '../../../../exception/index.js';

export const validation = (schema) => {
  return (request, response, next) => {

    const { error, value } = schema.validate(request.body, {
      abortEarly: false,
    });

    if (error) {
      return BadRequestException({
        message: error.details.map((detail) => detail.message).join(','),
      });
    }

    request.body = value;
    console.log({data : value});
    
    next();
  };
};
