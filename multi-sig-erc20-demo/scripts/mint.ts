import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { getJsonRpcProvider, getSafeFor } from "../utils";
import { consts } from "../common";
import { Token } from "../typechain-types";

export async function mint({ amount, address } : { amount?: string, address?: string}) {
    const networkName = network.name;
    console.log(`🍥 mint.ts: network - ${networkName}`);

    const { tokenAddress, safeOwners} = consts[networkName] ?? consts.localhost;
    const [owner1, owner2] = safeOwners;

    const jsonRpcProvider = getJsonRpcProvider(networkName);

    if (!amount || !address) throw Error("Required parameters are not provided! - amount, address");

    console.log(`🍥 amount - ${amount}, address - ${address}`);

    const tokenContractFactory = await ethers.getContractFactory("Token");
    const token: Token = tokenContractFactory.attach(tokenAddress);

    const owner1Wallet = new ethers.Wallet(owner1.pk, jsonRpcProvider);
    const decimals = await token.connect(owner1Wallet).decimals();

    const unitAmount = ethers.parseUnits(amount, decimals);
    console.log(`🍥 unitAmount - ${unitAmount}`);

    const owner1ProtocolKit = await getSafeFor(owner1.pk, networkName);
    const owner2ProtocolKit = await getSafeFor(owner2.pk, networkName);

    const mintTxData = token.interface.encodeFunctionData(
        "mint",
        [address, unitAmount]
    );

    const safeTxData: MetaTransactionData = {
        to: tokenAddress,
        value: "0",
        data: mintTxData
    };

    const safeTx = await owner1ProtocolKit.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await owner1ProtocolKit.getTransactionHash(safeTx);

    const owner1ApproveTx = await owner1ProtocolKit.approveTransactionHash(safeTxHash);
    const receipt1 = await owner1ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner1 approved mint: txHash - ${receipt1?.hash}`);

    const owner2ApproveTx = await owner2ProtocolKit.approveTransactionHash(safeTxHash);
    const receipt2 = await owner2ApproveTx.transactionResponse?.wait();

    console.log(`✅ owner2 approved mint: txHash - ${receipt2?.hash}`);

    const execTxRes = await owner1ProtocolKit.executeTransaction(safeTx);
    const receipt = await execTxRes.transactionResponse?.wait();

    console.log(`✅ owner1 executed tx: txHash - ${receipt?.hash}`); 

    const balanceAfter = await token.connect(owner1Wallet).balanceOf(address);
    console.log(`💰 token balance of address(${address}) - ${balanceAfter}`);    
}
