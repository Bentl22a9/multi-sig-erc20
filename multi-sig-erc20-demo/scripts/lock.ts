import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { getJsonRpcProvider, getSafeFor } from "../utils";
import { consts } from "../common";
import { Token, TokenLock } from "../typechain-types";

export async function main() {
    const networkName = network.name;
    console.log(`🍥 lock.ts: network - ${networkName}`);

    const { tokenAddress, tokenLockAddress, safeOwners} = consts[networkName] ?? consts.localhost;
    const [owner1, owner2] = safeOwners;

    const jsonRpcProvider = getJsonRpcProvider(networkName);

    const amount = "69";
    const latestBlock = await jsonRpcProvider.getBlock('latest');

    if (!latestBlock) throw Error("🚨 Failed to fetch the latest block");

    const currentTimestamp = latestBlock.timestamp;
    console.log(`🍥 currentTimestamp - ${currentTimestamp}`);

    const ONE_DAY = 24 * 60 * 60;
    const ONE_WEEK = 7 * ONE_DAY;
    const relesaeTime = currentTimestamp + ONE_WEEK;

    console.log(`🍥 lock: amount - ${amount}, releaseTime - ${relesaeTime}`);

    const Token = await ethers.getContractFactory("Token");
    const token: Token = Token.attach(tokenAddress);

    const TokenLock = await ethers.getContractFactory("TokenLock");
    const tokenLock: TokenLock = TokenLock.attach(tokenLockAddress);

    const owner1Wallet = new ethers.Wallet(owner1.pk, jsonRpcProvider);
    const decimals = await token.connect(owner1Wallet).decimals();

    const lockAmount = ethers.parseUnits(amount, decimals);
    console.log(`🍥 lockAmount - ${lockAmount}`);

    const safe1 = await getSafeFor(owner1.pk, networkName);
    const safe2 = await getSafeFor(owner2.pk, networkName);

    const lockTxData = tokenLock.interface.encodeFunctionData(
        "lock",
        [lockAmount, BigInt(`${relesaeTime}`)]
    );

    const safeTxData: MetaTransactionData = {
        to: tokenLockAddress,
        value: "0",
        data: lockTxData
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

    const locks = await tokenLock.connect(owner1Wallet).getLocks();
    console.log(`🔒 locks - ${locks}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });