import { z } from "zod";

export const WalletSchema = z.object({
  privateKey: z.string().trim().toLowerCase().regex(
    /^0x[a-f0-9]{64}$/,
    "address должен быть валидным Ethereum адресом"
  ),
  address: z.string().trim().regex(
      /^0x[a-fA-F0-9]{40}$/,
      "address должен быть валидным Ethereum адресом"
    ),
  mnemonic: z.string().trim().min(1, "Mnemonic не может быть пустым").refine(
    (val) => val.split(" ").length === 12, {
      message: "Mnemonic должен содержать ровно 12 слов",
    })
});