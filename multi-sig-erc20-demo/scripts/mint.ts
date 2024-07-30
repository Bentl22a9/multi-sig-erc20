import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers } from "hardhat";
import { getSafeFor } from "../utils";
import { ethersProvider, owner1Pk, owner2Pk, tokenContractAddress } from "../common";
import { Token } from "../typechain-types";

import * as dotenv from "dotenv";
dotenv.config();

export async function mint({ amount, address } : { amount?: string, address?: string}) {
    if (!amount || !address) throw Error("Required parameters are not provided! - amount, address");

    console.log(`args: amount - ${amount}, address - ${address}`);

    const tokenContractFactory = await ethers.getContractFactory("Token");
    const token: Token = tokenContractFactory.attach(tokenContractAddress);

    const owner1Signer = new ethers.Wallet(owner1Pk, ethersProvider);
    const decimals = await token.connect(owner1Signer).decimals();

    const unitAmount = ethers.parseUnits(amount, decimals);
    console.log(`unitAmount - ${unitAmount}`);

    const owner1ProtocolKit = await getSafeFor(owner1Pk);
    const owner2ProtocolKit = await getSafeFor(owner2Pk);

    const mintTxData = token.interface.encodeFunctionData(
        "mint",
        [address, unitAmount]
    );

    const safeTxData: MetaTransactionData = {
        to: tokenContractAddress,
        value: "0",
        data: mintTxData
    };

    const safeTx = await owner1ProtocolKit.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await owner1ProtocolKit.getTransactionHash(safeTx);

    const txResOnwer1 = await owner1ProtocolKit.approveTransactionHash(safeTxHash);
    await txResOnwer1.transactionResponse?.wait();

    console.log(`✅ owner1 approved mint`);

    const txResOwner2 = await owner2ProtocolKit.approveTransactionHash(safeTxHash);
    await txResOwner2.transactionResponse?.wait();

    console.log(`✅ owner2 approved mint`);

    const execTxRes = await owner1ProtocolKit.executeTransaction(safeTx);
    await execTxRes.transactionResponse?.wait();

    const balanceAfter = await token.connect(owner1Signer).balanceOf(address);
    console.log(`💰 token balance of address(${address}) - ${balanceAfter}`);    
}
