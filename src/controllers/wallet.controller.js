import { ethers } from "ethers";
import { ownerWallet } from "../config/web3.config.js"; 
import createError from "http-errors";

class WalletController {
    static async createWallet(req, res, next) {
        try {
            const wallet = ethers.Wallet.createRandom();

            const fundingTx = await ownerWallet.sendTransaction({
                to: wallet.address,
                value: ethers.parseEther("1.0")
            });
            await fundingTx.wait();

            res.status(201).json({
                wallet: {
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            }
            })

        } catch (e) {
            next(createError(500, "Failed to create wallet"));
            next();
        }
    }
}

export default WalletController;