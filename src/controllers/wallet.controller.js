import { prisma } from "../utils/prisma.js";
import { ethers } from "ethers";
import bcrypt from "bcrypt";
import { WalletHshSchema } from "../models/wallet.model.js";

class WalletController {
  // Создание нового кошелька
  static async createWallet(req, res, next) {
    try {
      const wallet = ethers.Wallet.createRandom();

      // Валидация privateKey + mnemonic
      WalletHshSchema.parse({
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
      });

      // Хешируем мнемонику
      const mnemonicHash = await bcrypt.hash(wallet.mnemonic.phrase, 10);

      // Сохраняем кошелек с хешем мнемоники
      await prisma.walletTest.create({
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonicHash,
        },
      });

      // Отправляем пользователю 12 слов
      res.status(201).json({
        message: "Кошелёк успешно создан",
        wallet: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic.phrase, // только для пользователя
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Импорт кошелька по privateKey + проверка мнемоники
  static async importWallet(req, res, next) {
    try {
      WalletHshSchema.parse(req.body);

      const { privateKey, address, mnemonic } = req.body;

      const wallet = await prisma.walletTest.findUnique({
        where: { privateKey },
      });

      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Кошелёк с таким privateKey не найден",
        });
      }

      // Проверяем хеш мнемоники
      const mnemonicMatch = await bcrypt.compare(mnemonic, wallet.mnemonicHash);

      if (wallet.address === address && mnemonicMatch) {
        return res.status(200).json({
          status: "success",
          message: "Кошелёк успешно импортирован",
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Данные кошелька не совпадают",
          details: {
            addressMatch: wallet.address === address,
            mnemonicMatch,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }
}

export default WalletController;
