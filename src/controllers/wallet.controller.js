import { prisma } from "../utils/prisma.js";
import { ethers } from "ethers";
import bcrypt from "bcrypt";
import createError from "http-errors";

class WalletController {
  static async createWallet(req, res, next) {
    try {
      const wallet = ethers.Wallet.createRandom();

      const mnemonicHash = await bcrypt.hash(wallet.mnemonic.phrase, 12);

      await prisma.walletTest.create({
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonicHash,
        },
      });

      res.status(201).json({
        status: "success",
        message: "Кошелёк успешно создан",
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic.phrase,
        },
      });
    } catch (err) {
      console.error("Ошибка создания кошелька:", err);

      if (err.code === "P2002") {
        return next(
          createError(409, "Кошелек с такими данными уже существует")
        );
      }

      next(createError(500, "Не удалось создать кошелек"));
    }
  }

  static async importWallet(req, res, next) {
    try {
      // ИСПРАВЛЕНО: убрал address из деструктуризации
      const { privateKey, mnemonic } = req.body;

      // Ищем кошелек по приватному ключу
      const existingWallet = await prisma.walletTest.findUnique({
        where: { privateKey },
      });

      if (!existingWallet) {
        return next(createError(404, "Кошелёк с таким privateKey не найден"));
      }

      // Проверяем мнемонику (сравниваем с хешированной версией в БД)
      const mnemonicMatch = await bcrypt.compare(
        mnemonic,
        existingWallet.mnemonicHash
      );

      // ИСПРАВЛЕНО: проверяем только mnemonic, без address
      if (!mnemonicMatch) {
        return next(createError(400, "Mnemonic не совпадает"));
      }

      res.status(200).json({
        status: "success",
        message: "Кошелёк успешно импортирован",
        data: {
          address: existingWallet.address,
        },
      });
    } catch (err) {
      console.error("Ошибка импорта кошелька:", err);
      next(createError(500, "Не удалось импортировать кошелек"));
    }
  }

  static async getWallet(req, res, next) {
    try {
      const { address } = req.params;

      const wallet = await prisma.walletTest.findUnique({
        where: { address },
        select: {
          address: true,
        },
      });

      if (!wallet) {
        return next(createError(404, "Кошелёк не найден"));
      }

      res.status(200).json({
        status: "success",
        data: wallet,
      });
    } catch (err) {
      console.error("Ошибка получения кошелька:", err);
      next(createError(500, "Не удалось получить информацию о кошельке"));
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
        status: "success",
        data: wallets,
      });
    } catch (err) {
      console.error("Ошибка получения списка кошельков:", err);
      next(createError(500, "Не удалось получить список кошельков"));
    }
  }
}

export default WalletController;
