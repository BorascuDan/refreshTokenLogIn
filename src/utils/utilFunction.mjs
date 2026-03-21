export function sendJsonResponse(
  res,
  {
    status = 200,
    message = "",
    data = null,
    success = status >= 200 && status < 300,
    code = null,
    stack = null,
  } = {}
) {
  const response = {
    success,
    message,
    data,
    ...(code && { code }),
    ...(stack && { stack }),
  };

  return res.status(status).json(response);
}