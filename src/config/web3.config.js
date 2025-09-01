import { ethers } from "ethers";
import dotenv from "dotenv";

export const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

export const ownerWallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
