import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
import { WalletHshSchema } from "../models/wallet.model.js";
import { validateWithSchema } from "../middlewares/wallet.middleware.js";

const router = Router();

router.post("/create", WalletController.createWallet);
router.post(
  "/import",
  validateWithSchema(WalletHshSchema),
  WalletController.importWallet
);
router.get("/:address", WalletController.getWallet);
router.get("/", WalletController.getAllWallets);

export default router;
