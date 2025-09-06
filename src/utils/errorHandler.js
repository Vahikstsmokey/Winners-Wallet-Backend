export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

 
  if (err.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "Кошелек с такими данными уже существует",
    });
  }

 
  res.status(500).json({
    status: "error",
    message: "Внутренняя ошибка сервера",
  });
}
