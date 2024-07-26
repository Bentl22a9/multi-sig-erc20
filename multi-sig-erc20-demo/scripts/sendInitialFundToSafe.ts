import { ethers } from "hardhat";
import { deployedSafeAddress, ethersProvider, owner1Pk } from "../common";

import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    
    const initialFundInWei = ethers.parseEther('1');

    const txParam = {
        to: deployedSafeAddress,
        value: initialFundInWei
    }

    const owner1Signer = new ethers.Wallet(owner1Pk, ethersProvider);

    const tx = await owner1Signer.sendTransaction(txParam);

    console.log(`Sending initial fund 💸💸💸`);
    console.log(`Deposit tx: ${tx.hash}`);

    const balanceInWei: bigint = await ethersProvider.getBalance(deployedSafeAddress);
    const balance = ethers.formatEther(balanceInWei);
    console.log(balance);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });