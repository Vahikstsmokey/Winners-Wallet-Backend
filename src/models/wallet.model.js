import { z } from "zod";

export const PrivateKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^0x[a-f0-9]{64}$/,
    "privateKey должен быть валидным hex (0x + 64 символа)"
  );

export const AddressSchema = z
  .string()
  .trim()
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    "address должен быть валидным Ethereum адресом"
  );

export const MnemonicSchema = z
  .string()
  .trim()
  .min(1, "Mnemonic не может быть пустым")
  .refine((val) => val.split(" ").length === 12, {
    message: "Mnemonic должен содержать ровно 12 слов",
  });

export const WalletSchema = z.object({
  privateKey: PrivateKeySchema,
  address: AddressSchema,
});

export const WalletHshSchema = z.object({
  privateKey: PrivateKeySchema,
  mnemonic: MnemonicSchema,
});
