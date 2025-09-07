import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";

const router = Router();

router.post("/create", WalletController.createWallet);
router.post("/import", WalletController.importWallet);
router.get("/:address", WalletController.getWallet);
router.get("/", WalletController.getAllWallets);

export default router;