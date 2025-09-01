import { Router } from "express";
import WalletRouter from "./wallet.router.js";

const router = Router();

router.use("/wallet", WalletRouter);

export default router;