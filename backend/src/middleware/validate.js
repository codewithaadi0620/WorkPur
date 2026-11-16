export function validate(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        const errorDetails = error.errors.map((e) => e.message).join('. ');
        return res.status(400).json({
          success: false,
          message: errorDetails || 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
