import { ethers } from "hardhat";
import Safe, { SafeAccountConfig, SafeFactory, SafeFactoryConfig, SafeProvider } from "@safe-global/protocol-kit";

import * as dotenv from "dotenv";
import { json } from "hardhat/internal/core/params/argumentTypes";
dotenv.config();

async function main() {
    
    const RPC_URL = process.env.RPC_URL || "";
    
    const owner_1_pk = process.env.ACCOUNT_0_PK || "";
    const owner_1_address = process.env.ACCOUNT_0_ADDRESS || "";
    const owner_2_address = process.env.ACCOUNT_1_ADDRESS || "";
    const owner_3_address = process.env.ACCOUNT_2_ADDRESS || "";
    
    const safeProvider: SafeProvider = new SafeProvider({ 
        provider: RPC_URL,
        signer: owner_1_pk
      });

    const chainId = await safeProvider.getChainId();
    console.log(chainId);

    const safeFactory = await SafeFactory.init({
        provider: RPC_URL,
        signer: owner_1_pk,
        contractNetworks: {
            [chainId]: {
                safeSingletonAddress: '0xa92d6282964e7c38D518ed080136dA6006285224',
                safeProxyFactoryAddress: '0x484E6B9EB1C7156125496e471DdB9eE967b9bd2F',
                multiSendAddress: '0x413399D067d3789D75c5883707eAb1721AA81b70',
                multiSendCallOnlyAddress: '0xA3FDA5Ce7852B0CE3370EF39DaA51B9F556c38F4',
                fallbackHandlerAddress: '0xdeF3cbD5b6a87e2A4158D771F42a8ce793570DFb',
                signMessageLibAddress: '0x1F4121813cb8848Ce356c50cffd1f19610FEc21c',
                createCallAddress: '0xD2175A68dD1f70da35aE35e7E5a1da8af9d4E70C',
                simulateTxAccessorAddress: '0xC3555d006Fe4280208340f4865390A2eC368AA12',
            }
        }
    });

    const safeAccountConfig: SafeAccountConfig = {
        owners: [
            owner_1_address,
            owner_2_address,
            owner_3_address 
        ],
        threshold: 2
    }

    const protocolKitOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

    const safeAddress = await protocolKitOwner1.getAddress();
    
    console.log("Safe has been deploted at ", safeAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });