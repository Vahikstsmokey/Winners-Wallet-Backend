import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";

const router = Router();

router.get("/", WalletController.createWallet);

export default router;