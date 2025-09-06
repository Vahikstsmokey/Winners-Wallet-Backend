
export function validateWithSchema(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        status: "error",
        message: "Ошибка валидации данных",
        errors: err.errors
          ? err.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            }))
          : [{ message: err.message }],
      });
    }
  };
}
