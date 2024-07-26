import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers } from "hardhat";
import { getSafeFor } from "../utils";
import { owner1Pk, owner2Address, owner2Pk } from "../common";

import * as dotenv from "dotenv";
dotenv.config();

async function main() {

    const owner1ProtocolKit = await getSafeFor(owner1Pk);
    const owner2ProtocolKit = await getSafeFor(owner2Pk);

    const amountInWei = ethers.parseUnits('0.5', 'ether');
    console.log(amountInWei);

    const safeTxData: MetaTransactionData = {
        to: owner2Address,
        value: amountInWei.toString(),
        data: "0x"
    };

    const safeTx = await owner1ProtocolKit.createTransaction({ transactions: [safeTxData] });
    const safeTxHashOwner1 = await owner1ProtocolKit.getTransactionHash(safeTx);

    const txResOnwer1 = await owner1ProtocolKit.approveTransactionHash(safeTxHashOwner1);
    await txResOnwer1.transactionResponse?.wait();

    const safeTxHashOwner2 = await owner2ProtocolKit.getTransactionHash(safeTx);

    const txResOwner2 = await owner2ProtocolKit.approveTransactionHash(safeTxHashOwner2);
    await txResOwner2.transactionResponse?.wait();

    const execTxRes = await owner1ProtocolKit.executeTransaction(safeTx);
    await execTxRes.transactionResponse?.wait();

    const owner1Balance = await owner1ProtocolKit.getBalance();
    console.log(`owner1 balance after tx: ${ethers.formatUnits(owner1Balance, 'ether')} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });