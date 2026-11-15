export function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL check or custom constraint error
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A resource with this identifier already exists (Unique constraint violation).',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced foreign key entity does not exist.',
      detail: err.detail,
    });
  }

  // Stored procedure / trigger custom exception
  if (err.code === 'P0001') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
