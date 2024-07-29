import { SafeProvider } from "@safe-global/protocol-kit";
import dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

export const RPC_URL = process.env.RPC_URL || "";
    
export const owner1Pk = process.env.ACCOUNT_0_PK || "";
export const owner1Address = process.env.ACCOUNT_0_ADDRESS || "";

export const owner2Pk = process.env.ACCOUNT_1_PK || "";
export const owner2Address = process.env.ACCOUNT_1_ADDRESS || "";

export const owner3Address = process.env.ACCOUNT_2_ADDRESS || "";
  
export const deployedSafeAddress = process.env.SAFE_PROXY_ADDRESS || "";

export const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS || "";

export const safeProvider = new SafeProvider({ 
    provider: RPC_URL,
    signer: owner1Pk,
});

export const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);