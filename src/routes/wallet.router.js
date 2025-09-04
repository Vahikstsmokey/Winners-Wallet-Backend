import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
import { WalletHshSchema } from "../models/wallet.model.js";
import { z } from "zod";

const router = Router();

// Универсальный middleware для валидации через Zod
function validateWithSchema(schema) {
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

// Создать кошелёк
// Здесь валидация не нужна, данные генерируются на сервере
router.post("/create", WalletController.createWallet);

// Импорт кошелька с проверкой через Zod
router.post(
  "/import",
  validateWithSchema(WalletHshSchema), // проверяем privateKey + mnemonic
  WalletController.importWallet
);

export default router;
