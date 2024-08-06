import { ethers, network } from "hardhat";

import { consts} from "../common";
import { getJsonRpcProvider } from "../utils";

async function main() {
  const networkName = network.name;
  console.log(`🍥 deployTokenLock.ts: network - ${networkName}`);

  const { safeOwners, safeAddress, tokenAddress } = consts[networkName] ?? consts.localhost;
  const [owner1] = safeOwners;

  const jsonRpcProvider = getJsonRpcProvider(networkName);

  const owner1Wallet = new ethers.Wallet(owner1.pk, jsonRpcProvider);

  const constructorArgs = [
    tokenAddress,
    safeAddress,
    safeAddress
  ];

  console.log(`🍥 Constructor args - ${constructorArgs}`);

  const TokenLock = await ethers.getContractFactory("TokenLock", owner1Wallet);
  const tokenLock = await TokenLock.deploy(...constructorArgs);

  const deployTx = await tokenLock.deploymentTransaction()?.wait();

  const tokenLockAddress = await tokenLock.getAddress();

  console.log(`🍥 TokenLock deployed at ${tokenLockAddress}, txHash - ${deployTx?.hash}`);
  console.log(`🍥 Copy and paste the address to .env`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
