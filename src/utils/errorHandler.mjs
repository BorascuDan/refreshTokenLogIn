import { sendJsonResponse } from "./utilFunction.mjs";

export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, code } = err;

  const isDev = process.env.NODE_ENV === 'dev';
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  }

  return sendJsonResponse(res, {
    status: statusCode,
    success: false,
    message,
    code,
    stack: isDev ? err.stack : null,
  });
};

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
};