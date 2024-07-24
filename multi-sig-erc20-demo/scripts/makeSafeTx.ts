import Safe, { SafeProvider } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import * as dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

async function main() {

    const RPC_URL = process.env.RPC_URL || "";
    
    const owner1Pk = process.env.ACCOUNT_0_PK || "";
    const owner1Address = process.env.ACCOUNT_0_ADDRESS || "";

    const owner2Pk = process.env.ACCOUNT_1_PK || "";
    const owner2Address = process.env.ACCOUNT_1_ADDRESS || "";
    
    const deployedSafeAddress: string = process.env.SAFE_PROXY_ADDRESS || "";
    
    if (!RPC_URL || !owner1Pk || !owner1Address || !owner2Pk || !owner2Address || !deployedSafeAddress) {
        throw new Error("Please set all required environment variables.");
    }

    const safeProvider: SafeProvider = new SafeProvider({ 
        provider: RPC_URL,
        signer: owner1Pk,
      });

    const chainId = await safeProvider.getChainId();
    console.log(chainId);

    const apiKit = new SafeApiKit({
        chainId,
        txServiceUrl: RPC_URL
    });

    const owner1ProtocolKit = await Safe.init({
        provider: RPC_URL,
        signer: owner1Pk,
        safeAddress: deployedSafeAddress,
        contractNetworks: {
            // safeVersion: 1.4.1
            // [chainId + '']: {
            //     safeSingletonAddress: '0xa92d6282964e7c38D518ed080136dA6006285224',
            //     safeProxyFactoryAddress: '0x484E6B9EB1C7156125496e471DdB9eE967b9bd2F',
            //     multiSendAddress: '0x413399D067d3789D75c5883707eAb1721AA81b70',
            //     multiSendCallOnlyAddress: '0xA3FDA5Ce7852B0CE3370EF39DaA51B9F556c38F4',
            //     fallbackHandlerAddress: '0xdeF3cbD5b6a87e2A4158D771F42a8ce793570DFb',
            //     signMessageLibAddress: '0x1F4121813cb8848Ce356c50cffd1f19610FEc21c',
            //     createCallAddress: '0xD2175A68dD1f70da35aE35e7E5a1da8af9d4E70C',
            //     simulateTxAccessorAddress: '0xC3555d006Fe4280208340f4865390A2eC368AA12',
            // }

            // safeVersion: 1.3.0
            [chainId + '']: {
                safeSingletonAddress: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552', 
                safeProxyFactoryAddress: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                multiSendAddress: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                multiSendCallOnlyAddress: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                fallbackHandlerAddress: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
                signMessageLibAddress: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                createCallAddress: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',
                simulateTxAccessorAddress: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
            }
        }
    });

    const amountInWei = ethers.parseUnits('0.5', 'ether');
    console.log(amountInWei);

    const safeTxData: MetaTransactionData = {
        to: owner2Address,
        value: amountInWei.toString(),
        data: "0x"
    };

    const safeTx = await owner1ProtocolKit.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await owner1ProtocolKit.getTransactionHash(safeTx);
    // const senderSignature = await owner1ProtocolKit.signHash(safeTxHash);

    const txRes = await owner1ProtocolKit.approveTransactionHash(safeTxHash);
    await txRes.transactionResponse?.wait();
    
    // await apiKit.proposeTransaction({
    //     safeAddress: deployedSafeAddress,
    //     safeTransactionData: safeTx.data,
    //     safeTxHash: safeTxHash,
    //     senderSignature: senderSignature.data,
    //     senderAddress: owner1Address
    // });

    // const txListResponse = await apiKit.getPendingTransactions(deployedSafeAddress);
    // console.log(txListResponse.count);

    // const pendingTransactions = txListResponse.results;
    // console.log(pendingTransactions);

    // const tx = pendingTransactions[0];
    // const txHash = tx.safeTxHash;

    const owner2ProtocolKit = await Safe.init({
        provider: RPC_URL,
        signer: owner2Pk,
        safeAddress: deployedSafeAddress,
        contractNetworks: {
            // safeVersion: 1.4.1
            // [chainId + '']: {
            //     safeSingletonAddress: '0xa92d6282964e7c38D518ed080136dA6006285224',
            //     safeProxyFactoryAddress: '0x484E6B9EB1C7156125496e471DdB9eE967b9bd2F',
            //     multiSendAddress: '0x413399D067d3789D75c5883707eAb1721AA81b70',
            //     multiSendCallOnlyAddress: '0xA3FDA5Ce7852B0CE3370EF39DaA51B9F556c38F4',
            //     fallbackHandlerAddress: '0xdeF3cbD5b6a87e2A4158D771F42a8ce793570DFb',
            //     signMessageLibAddress: '0x1F4121813cb8848Ce356c50cffd1f19610FEc21c',
            //     createCallAddress: '0xD2175A68dD1f70da35aE35e7E5a1da8af9d4E70C',
            //     simulateTxAccessorAddress: '0xC3555d006Fe4280208340f4865390A2eC368AA12',
            // }

            // safeVersion: 1.3.0
            [chainId + '']: {
                safeSingletonAddress: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552', 
                safeProxyFactoryAddress: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                multiSendAddress: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                multiSendCallOnlyAddress: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                fallbackHandlerAddress: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
                signMessageLibAddress: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                createCallAddress: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',
                simulateTxAccessorAddress: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
            }
        }
    });

    // const owner2Signature = await owner2ProtocolKit.signHash(txHash);
    // const response = await apiKit.confirmTransaction(txHash, owner2Signature.data);

    // const approvedSafeTx = await apiKit.getTransaction(txHash);
    const executeTxResponse = await owner1ProtocolKit.executeTransaction(approvedSafeTx);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    const balance = await owner1ProtocolKit.getBalance();
    console.log(`balance after tx: ${ethers.formatUnits(balance, 'ether')} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });