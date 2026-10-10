import { NotFoundException, sendSuccess } from './common/_EXPORT.js';

export const mainFeedbackService = ({ lang, res }) => {
  sendSuccess({
    res,
    statusCode: 200,
    messageCode: 101,
    lang,
  });
};
export const notFoundFeedbackService = () => {
  NotFoundException({ messageCode: 102 });
};
