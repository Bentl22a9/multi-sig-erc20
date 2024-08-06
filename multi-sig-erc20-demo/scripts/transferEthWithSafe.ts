import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { getJsonRpcProvider, getSafeFor } from "../utils";
import { consts } from "../common";

async function main() {
    const networkName = network.name;
    console.log(`🍥 transferEthWithSafe.ts: network - ${networkName}`);

    const { safeAddress, safeOwners } = consts[networkName] ?? consts.localhost;
    const [owner1, owner2] = safeOwners;

    const safe1 = await getSafeFor(owner1.pk, networkName);
    const safe2 = await getSafeFor(owner2.pk, networkName);

    const jsonRpcProvider = getJsonRpcProvider(networkName);

    const amountInWei = ethers.parseUnits('0.0000069', 18);

    const safeTxData: MetaTransactionData = {
        to: owner1.address,
        value: amountInWei.toString(),
        data: "0x"
    };

    const owner1BalanceBefore = await jsonRpcProvider.getBalance(owner1.address);
    const safeBalanceBefore = await jsonRpcProvider.getBalance(safeAddress);
    console.log(`🍥 owner1 balance - ${ethers.formatUnits(owner1BalanceBefore, 18)} ETH`);
    console.log(`🍥 safe balance - ${ethers.formatUnits(safeBalanceBefore, 18)} ETH`);

    const safeTx = await safe1.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await safe1.getTransactionHash(safeTx);

    const owner1ApproveTx = await safe1.approveTransactionHash(safeTxHash);
    const receipt1 = await owner1ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner1 approved tx: txHash - ${receipt1?.hash}`);

    const owner2ApproveTx = await safe2.approveTransactionHash(safeTxHash);
    const receipt2 = await owner2ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner2 approved tx: txHash - ${receipt2?.hash}`);

    const execTxRes = await safe1.executeTransaction(safeTx);
    const receipt = await execTxRes.transactionResponse?.wait();

    console.log(`✅ owner1 executed tx: txHash - ${receipt?.hash}`);    

    const owner1BalanceAfter = await jsonRpcProvider.getBalance(owner1.address);
    const safeBalanceAfter = await jsonRpcProvider.getBalance(safeAddress);
    console.log(`🍥 owner1 balance - ${ethers.formatUnits(owner1BalanceAfter, 18)} ETH`);
    console.log(`🍥 safe balance - ${ethers.formatUnits(safeBalanceAfter, 18)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });