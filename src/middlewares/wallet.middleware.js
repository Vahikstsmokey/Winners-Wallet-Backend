import { WalletSchema, WalletHshSchema } from "../models/wallet.model.js";

// Универсальный валидатор, который принимает схему
export function validateWithSchema(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      res.status(400).json({
        error: err.errors ? err.errors.map((e) => e.message) : err.message,
      });
    }
  };
}
