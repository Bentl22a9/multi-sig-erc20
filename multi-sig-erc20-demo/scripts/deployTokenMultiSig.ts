import { ethers } from "hardhat";
import path from "path";
import fs from "fs";
import { deployedSafeAddress, ethersProvider, owner1Pk, owner2Pk } from "../common";
import { getSafeFor } from "../utils";

import * as dotenv from "dotenv";
import { Token } from "../typechain-types";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
dotenv.config();

async function main() {

  const createCallABIPath = path.resolve(__dirname, "../../safe-smart-account/deployments/localhost/CreateCall.json");
  const createCallJson = JSON.parse(fs.readFileSync(createCallABIPath, "utf8"));
  const createCallABI = createCallJson["abi"];

  // safe-smart-account - CreateCall.sol
  const createCallContract = new ethers.Contract('0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4', createCallABI);

  const constructorArgs = [
    "GM",
    "GM",
    deployedSafeAddress,
    18,
    ethers.parseUnits("69420", 18)
  ];
  const tokenContractFactory = await ethers.getContractFactory("Token");
  const deployTx = await tokenContractFactory.getDeployTransaction(...constructorArgs);

  const performCreateData = createCallContract.interface.encodeFunctionData(
    "performCreate",
    [0, deployTx.data]
  );

  const createCallTxParam: MetaTransactionData = {
    data: performCreateData,
    value: '0',
    to: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4' // CreateCall.sol
  };

  const owner1ProtocolKit = await getSafeFor(owner1Pk);
  const owner2ProtocolKit = await getSafeFor(owner2Pk);

  const deploySafeTx = await owner1ProtocolKit.createTransaction({ transactions: [createCallTxParam] });
  const deploySafeTxHash1 = await owner1ProtocolKit.getTransactionHash(deploySafeTx);
  
  const approvalRes1 = await owner1ProtocolKit.approveTransactionHash(deploySafeTxHash1);
  await approvalRes1.transactionResponse?.wait();

  console.log(`✅ owner1 approved deployment`);

  const approvalRes2 = await owner2ProtocolKit.approveTransactionHash(deploySafeTxHash1);
  await approvalRes2.transactionResponse?.wait();

  console.log(`✅ owner2 approved deployment`);

  const deployTxRes = await owner1ProtocolKit.executeTransaction(deploySafeTx);
  const deployTxReceipt = await deployTxRes.transactionResponse?.wait();
  
  console.log(`Deployment executed by owner1 🚀🚀🚀`, deployTxReceipt.hash);

  const eventABI = ["event ContractCreation(address newContract)"];  
  const iface = new ethers.Interface(eventABI);

  const log = deployTxReceipt?.logs.find((log) => {
    try {
      const parsedLog = iface.parseLog(log);
      return parsedLog?.name === "ContractCreation";
    } catch (error) {
      return false;
    }
  });

  var tokenContractAddress: string = '';
  if (log) {
    const parsedLog = iface.parseLog(log)!;
    tokenContractAddress = parsedLog.args.newContract;
      console.log("Token contract has been deployed at:", tokenContractAddress);
      console.log('🍥 Copy and paste the contract address to .env')
  } else {
    console.error("ContractCreation event not found in logs");
  }

  if (tokenContractAddress.length == 0) throw new Error('Token contract not found');

  const token: Token = tokenContractFactory.attach(tokenContractAddress);

  const owner1Signer = new ethers.Wallet(owner1Pk, ethersProvider);

  const owner = await token.connect(owner1Signer).getOwner();
  if (owner === deployedSafeAddress) console.log('Deployed contract owner matches safe multi-sig address 👏👏👏');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
