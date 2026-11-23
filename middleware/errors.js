export function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function notFound(_request, _response, next) {
  next(createHttpError(404, "Endpoint not found."));
}

export function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;
  const message = status >= 500 ? "Internal server error." : error.message;
  response.status(status).json({ message });
}
