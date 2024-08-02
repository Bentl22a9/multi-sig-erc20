import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployedSafeAddress, ethersProvider, owner1Address, owner1Pk, owner2Address, owner2Pk, owner3Address, owner3Pk, RPC_URL, safeProvider } from "../common";
import { Token, TokenLock } from "../typechain-types";
import Safe, { SafeAccountConfig, SafeFactory } from "@safe-global/protocol-kit";
import { getSafeFor } from "../utils";

describe("TokenLock", function () {

  async function deploySafeFixture() {
    const chainId = await safeProvider.getChainId();
  
      const safeFactory = await SafeFactory.init({
          provider: RPC_URL,
          signer: owner1Pk,
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
  
      const safeAccountConfig: SafeAccountConfig = {
          owners: [
              owner1Address,
              owner2Address,
              owner3Address 
          ],
          threshold: 2
      };
  
      try {
        await safeFactory.deploySafe({ safeAccountConfig });
      } catch (error) {
        console.error("🚨🚨🚨 Safe proxy already exists!");
      }

      const safeList = [
        await getSafeFor(owner1Pk),
        await getSafeFor(owner2Pk),
        await getSafeFor(owner3Pk)
      ];

      const safeAddress = await safeList[0].getAddress();
      console.log("🍥 Safe has been deployed at", safeAddress);

      const owner1Wallet = new ethers.Wallet(owner1Pk, ethersProvider);
      
      const initialFundInWei = ethers.parseEther('100');

      const txParam = {
          to: safeAddress,
          value: initialFundInWei
      }

      const tx = await owner1Wallet.sendTransaction(txParam);
      console.log(`Sending initial fund 💸💸💸`);

      return safeList; 
  }

  async function deployTokenFixture(safe: string) {
    const owner1Wallet = new ethers.Wallet(owner1Pk, ethersProvider);

    const constructorArgs = [
      "GM",
      "GM",
      safe,
      18,
      ethers.parseUnits("69420", 18)
    ];

    const Token = await ethers.getContractFactory("Token", owner1Wallet);
    const token: Token = await Token.deploy(...constructorArgs);
    const tokenAddress = await token.getAddress();

    console.log(`🍥 Token deployed at ${tokenAddress} by ${owner1Wallet.address}`);

    return { token };
  } 

  async function deployTokenLockFixture(
    token: string,
    safe: string
  ) {
    const owner1Wallet = new ethers.Wallet(owner1Pk, ethersProvider);

    const constructorArgs = [
      token,
      safe,
      safe
    ];

    const TokenLock = await ethers.getContractFactory("TokenLock", owner1Wallet);
    const tokenLock: TokenLock = await TokenLock.deploy(...constructorArgs);
    const tokenLockAddress = await tokenLock.getAddress();

    console.log(`🍥 TokenLock has been deployed at ${tokenLockAddress} by ${owner1Wallet.address}`);
  }

  describe("Deployment", function () {
    it("Should match pre-defined safe address", async function () {
      const [safe1] = await loadFixture(deploySafeFixture);

      expect(await safe1.getAddress()).to.equal(deployedSafeAddress);
    });

    it("Should hold initial fund", async function () {
      const [safe1] = await loadFixture(deploySafeFixture);
      const safeAddress = await safe1.getAddress();

      expect(await ethersProvider.getBalance(safeAddress)).to.greaterThan(0);
    });

    // it("", async function () {
    //   const { token, tokenAddress } = await deployTokenFixture();

    //   console.log(tokenAddress);
    //   console.log(await token.getOwner());
    // });
  });

  describe

});
