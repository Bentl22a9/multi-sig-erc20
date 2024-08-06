import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { getJsonRpcProvider, getSafeFor } from "../utils";
import { consts } from "../common";
import { Token, TokenLock } from "../typechain-types";

export async function main() {
    const networkName = network.name;
    console.log(`🍥 approve.ts: network - ${networkName}`);

    const { tokenAddress, tokenLockAddress, safeOwners } = consts[networkName] ?? consts.localhost;
    const [owner1, owner2] = safeOwners;

    const amount = ethers.MaxUint256;

    const Token = await ethers.getContractFactory("Token");
    const token: Token = Token.attach(tokenAddress);

    const safe1 = await getSafeFor(owner1.pk, networkName);
    const safe2 = await getSafeFor(owner2.pk, networkName);

    const approveTxData = token.interface.encodeFunctionData(
        "approve",
        [tokenLockAddress, amount]
    );

    const safeTxData: MetaTransactionData = {
        to: tokenAddress,
        value: "0",
        data: approveTxData
    };

    const safeTx = await safe1.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await safe1.getTransactionHash(safeTx);

    const owner1ApproveTx = await safe1.approveTransactionHash(safeTxHash);
    const receipt1 = await owner1ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner1 approved lock: txHash - ${receipt1?.hash}`);

    const owner2ApproveTx = await safe2.approveTransactionHash(safeTxHash);
    const receipt2 = await owner2ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner2 approved lock: txHash - ${receipt2?.hash}`);

    const execTxRes = await safe1.executeTransaction(safeTx);
    const receipt = await execTxRes.transactionResponse?.wait();

    console.log(`✅ owner1 executed tx: txHash - ${receipt?.hash}`); 
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });