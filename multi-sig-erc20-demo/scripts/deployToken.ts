import { ethers } from "hardhat";
import Safe, { SafeProvider } from "@safe-global/protocol-kit";

import path from "path";
import fs from "fs";

import * as dotenv from "dotenv";
dotenv.config();

async function main() {

  const RPC_URL = process.env.RPC_URL || "";
    
  const owner1Pk = process.env.ACCOUNT_0_PK || "";
  const owner1Address = process.env.ACCOUNT_0_ADDRESS || "";

  if (!RPC_URL || !owner1Pk || !owner1Address) {
    throw new Error("Please set all required environment variables.");
  }

  const jsonRpcProvider = new ethers.JsonRpcProvider(RPC_URL);

  const createCallABIPath = path.resolve(__dirname, "../../safe-smart-account/deployments/custom/CreateCall.json");
  const createCallJson = JSON.parse(fs.readFileSync(createCallABIPath, "utf8"));
  const createCallABI = createCallJson["abi"];

  // from safe-smart-account
  const createCallContract = new ethers.Contract('0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',createCallABI);

  const constructorArgs = [
    "GM",
    "GM",
    18,
    ethers.parseUnits("69420", 18),
    ethers.parseUnits("69420", 18)
  ];
  const tokenContractFactory = await ethers.getContractFactory("Token");
  const deployTx = await tokenContractFactory.getDeployTransaction(...constructorArgs);

  const performCreateData = createCallContract.interface.encodeFunctionData(
    "performCreate",
    [0, deployTx.data]
  );

  const createCallTxParam = {
    data: performCreateData,
    value: '0',
    to: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4' // CreateCall.sol
  };

  const signer1 = new ethers.Wallet(owner1Pk, jsonRpcProvider);
  const res = await signer1.sendTransaction(createCallTxParam);
  const receipt = await res.wait();
  
  console.log('Deployment executed 🚀🚀🚀');

  const eventABI = ["event ContractCreation(address newContract)"];  
  const iface = new ethers.Interface(eventABI);

  const log = receipt?.logs.find((log) => {
    try {
      const parsedLog = iface.parseLog(log);
      return parsedLog?.name === "ContractCreation";
    } catch (error) {
      return false;
    }
  });

  if (log) {
    const parsedLog = iface.parseLog(log);
    const newContractAddress = parsedLog?.args.newContract;
    console.log("Token contract has been deployed at:", newContractAddress);
  } else {
    console.error("ContractCreation event not found in logs");
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
