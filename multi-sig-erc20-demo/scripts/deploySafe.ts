import { ethers } from "hardhat";
import Safe, { SafeFactory } from "@safe-global/protocol-kit";

async function main() {
    
    const RPC_URL = "http://localhost:8545";

    const [deployer] = await ethers.getSigners();

    const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL);
    
}