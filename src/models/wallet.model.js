import { z } from "zod";

// Приватный ключ Ethereum (64 hex символа после 0x)
export const PrivateKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^0x[a-f0-9]{64}$/,
    "privateKey должен быть валидным hex (0x + 64 символа)"
  );

// Адрес Ethereum (40 hex символов после 0x)
export const AddressSchema = z
  .string()
  .trim()
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    "address должен быть валидным Ethereum адресом"
  );

// Мнемоника (ровно 12 слов)
export const MnemonicSchema = z
  .string()
  .trim()
  .nonempty()
  .refine((val) => val.split(" ").length === 12, {
    message: "Mnemonic must contain exactly 12 words",
  });

// Для создания кошелька (privateKey + address)
export const WalletSchema = z.object({
  privateKey: PrivateKeySchema,
  address: AddressSchema,
});

// Для импорта кошелька (privateKey + мнемоника)
export const WalletHshSchema = z.object({
  privateKey: PrivateKeySchema,
  mnemonic: MnemonicSchema,
});
