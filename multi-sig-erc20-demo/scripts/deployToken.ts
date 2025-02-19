import { ethers, network } from "hardhat";

import { consts} from "../common";
import { getJsonRpcProvider } from "../utils";

async function main() {
  const networkName = network.name;
  console.log(`🍥 deployToken.ts: network - ${networkName}`);

  const { safeOwners, safeAddress } = consts[networkName] ?? consts.localhost;
  const [owner1] = safeOwners;

  const jsonRpcProvider = getJsonRpcProvider(networkName);

  const owner1Wallet = new ethers.Wallet(owner1.pk, jsonRpcProvider);

  const constructorArgs = [
    "GM",
    "GM",
    safeAddress,
    18,
    ethers.parseUnits("69420", 18)
  ];

  console.log(`🍥 Constructor args - ${constructorArgs}`);

  const Token = await ethers.getContractFactory("Token", owner1Wallet);
  const token = await Token.deploy(...constructorArgs);

  const deployTx = await token.deploymentTransaction()?.wait();

  const tokenAddress = await token.getAddress();

  console.log(`🍥 Token deployed at ${tokenAddress}, txHash - ${deployTx?.hash}`);
  console.log(`🍥 Copy and paste the address to .env`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
