import { ethers, network } from "hardhat";
import { consts } from "../common";
import { getJsonRpcProvider } from "../utils";

async function main() {
    const networkName = network.name;
    console.log(`🍥 fundSafe.ts: network - ${networkName}`);

    const { safeAddress, safeOwners } = consts[networkName] ?? consts.localhost;

    const ethAmount = "100";
    const initialFundInWei = ethers.parseUnits(ethAmount, 18);

    const txParam = {
        to: safeAddress,
        value: initialFundInWei
    };

    const [owner1] = safeOwners;
    const jsonRpcProvider = getJsonRpcProvider(networkName);
    const owner1Wallet = new ethers.Wallet(owner1.pk, jsonRpcProvider);

    const tx = await owner1Wallet.sendTransaction(txParam);

    console.log(`💸💸💸 Funding safeAddress - ${safeAddress} for ${ethAmount} ETH, txHash - ${tx.hash}`);

    const balanceInWei: bigint = await jsonRpcProvider.getBalance(safeAddress);
    const balance = ethers.formatUnits(balanceInWei, 18);
    console.log(`🍥 Safe address balance - ${balance}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });