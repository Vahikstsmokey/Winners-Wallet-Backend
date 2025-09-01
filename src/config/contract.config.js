import { ethers } from "ethers";
import { ownerWallet } from "./web3.config.js";
import { CONTRACT_ABI } from "../contacts/contract.abi.js";

export const contract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  CONTRACT_ABI,
  ownerWallet
);