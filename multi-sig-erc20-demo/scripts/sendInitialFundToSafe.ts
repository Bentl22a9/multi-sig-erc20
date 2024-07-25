import * as dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

async function main() {
    
    const RPC_URL = process.env.RPC_URL || "";
    
    const owner1Pk = process.env.ACCOUNT_0_PK || "";
    
    const deployedSafeAddress: string = process.env.SAFE_PROXY_ADDRESS || "";

    const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);

    const initialFundInWei = ethers.parseEther('1');

    const txParam = {
        to: deployedSafeAddress,
        value: initialFundInWei
    }

    const owner1Signer = new ethers.Wallet(owner1Pk, ethersProvider);

    const tx = await owner1Signer.sendTransaction(txParam);

    console.log(`Sending initial fund...`);
    console.log(`Deposit tx: ${tx.hash}`);

    const balanceInWei: bigint = await ethersProvider.getBalance(deployedSafeAddress);
    const balance = ethers.formatEther(balanceInWei);
    console.log(balance);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });