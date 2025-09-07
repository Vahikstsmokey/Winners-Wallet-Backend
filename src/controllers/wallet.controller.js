import { WalletSchema } from "../models/wallet.model.js";
import { ownerWallet } from "../config/web3.config.js";
import { prisma } from "../utils/prisma.js";
import { ethers } from "ethers"
import bcrypt from "bcrypt";
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

  static async importWallet(req, res, next) {
    try {
      const { privateKey, mnemonic } = req.body;

      const existingWallet = await prisma.walletTest.findUnique({
        where: {
          privateKey
        },
      });

      if (!existingWallet) {
        return next(createError(404, "Wallet with such privateKey not found"));
      }

      const mnemonicMatch = await bcrypt.compare(
        mnemonic,
        existingWallet.mnemonicHash
      );

      if (!mnemonicMatch) {
        return next(createError(400, "Mnemonic does not match"));
      }

      res.status(200).json({
        message: "Wallet successfully imported",
        data: {
          address: existingWallet.address,
        },
      });
    } catch (err) {
      next(createError(500, "Failed to import wallet"));
      next()
    }
  }

  static async getWallet(req, res, next) {
    try {
      const { address } = req.params;

      const wallet = await prisma.walletTest.findUnique({
        where: {
          address
        },
        select: {
          address: true,
        },
      });

      if (!wallet) {
        return next(createError(404, "Wallet not found"));
      }

      res.status(200).json({
        message: "",
        data: wallet,
      });
    } catch (err) {
      next(createError(500, "Failed to get wallet information"));
      next()
    }
  }

  static async getAllWallets(req, res, next) {
    try {
      const wallets = await prisma.walletTest.findMany({
        select: {
          address: true,
        },
      });

      res.status(200).json({
        data: wallets,
      });
    } catch (err) {
      next(createError(500, "Failed to get list of wallets"));
      next()
    }
  }
}

export default WalletController;