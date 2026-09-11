import { Router } from 'express';
import { signUp } from './authentication.service.js';
import { sendSuccess } from '../../../../common/main/structure/index.js';
import { validation } from '../../../../common/main/middleware/main/pipe/main/validation.pipe.js';
import { signUpSchema } from './dto/signup.dto.js';
export const authenticationController = Router();

authenticationController.post('/signup', validation(signUpSchema), async (request, response) => {
  const serviceFeedback = await signUp(request.body);
  return sendSuccess({ response, ...serviceFeedback });
});
