export const WalletMiddleware = (req, res, next) => {
  try {
    const { } = req.headers;

  } catch (e) {
    console.log(e, "error WalletMiddleware");
    next();
  }
}