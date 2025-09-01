import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";

const router = Router();

router.post("/create", WalletController.createWallet);

export default router;