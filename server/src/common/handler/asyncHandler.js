// Kept for API compatibility: Express 5 already forwards rejected promises to the error handler.
export const asyncHandler = (fn) => {
  return async (...args) => await fn(...args);
};
