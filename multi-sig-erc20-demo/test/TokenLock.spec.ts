import {
  loadFixture, time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import { owner1Address, owner1Pk, owner2Address, owner2Pk, owner3Address, owner3Pk, RPC_URL, safeProvider } from "../common";
import { Token, TokenLock } from "../typechain-types";
import Safe, { SafeAccountConfig, SafeFactory } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { getSafeFor } from "../utils";

describe("TokenLock", function () {
  const owner1Wallet = new ethers.NonceManager(new ethers.Wallet(owner1Pk, ethers.provider));

  this.beforeEach(async function () {
    Object.assign(this, await loadFixture(deployContractsFixture));
  });

  async function approveTx(hash: string, safe: Safe) {
    const txRes = await safe.approveTransactionHash(hash);
    await txRes.transactionResponse?.wait();
  }

  async function sendMultiSigTx(safeTxData: MetaTransactionData) {
    const safe1 = await getSafeFor(owner1Pk);
    const safe2 = await getSafeFor(owner2Pk);

    const safeTx = await safe1.createTransaction({ transactions: [safeTxData] });
    const safeTxHash = await safe1.getTransactionHash(safeTx);

    await Promise.all([safe1, safe2].map((safe) => approveTx(safeTxHash, safe)));

    const execTxRes = await safe1.executeTransaction(safeTx);
    return await execTxRes.transactionResponse?.wait();
  }

  async function lock(token: Token, tokenLock: TokenLock, amount: string, releaseTime: BigInt) {
    const decimals = await token.connect(owner1Wallet).decimals();
    const unitAmount = ethers.parseUnits(amount, decimals);
    
    const lockTxData = tokenLock.interface.encodeFunctionData(
      "lock",
      [unitAmount, BigInt(`${releaseTime}`)]
    );

    const safeTxData: MetaTransactionData = {
      to: await tokenLock.getAddress(),
      value: "0",
      data: lockTxData
    };

    await sendMultiSigTx(safeTxData);
    console.log(`🔐 lock: amount - ${amount}, releaseTime - ${releaseTime}`);
  }

  async function deployContractsFixture() {
    // Safe
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
      await safeFactory.deploySafe({ 
        safeAccountConfig,
      });
    } catch (error) {
      console.error("🚨🚨🚨 Safe has already been deployed!");
    }

    const safeList = [
      await getSafeFor(owner1Pk),
      await getSafeFor(owner2Pk),
      await getSafeFor(owner3Pk)
    ];

    const safeAddress = await safeList[0].getAddress();
    console.log("🍥 Safe has been deployed at", safeAddress);
    
    const initialFundInWei = ethers.parseEther('100');

    const txParam = {
        to: safeAddress,
        value: initialFundInWei
    };

    await owner1Wallet.sendTransaction(txParam);
    console.log(`🍥 Sending initial fund 💸💸💸`);

    // Token
    const tokenConstrucutorArgs = [
      "GM",
      "GM",
      safeAddress,
      18,
      ethers.parseUnits("69420", 18)
    ];

    const Token = await ethers.getContractFactory("Token", owner1Wallet);
    const token: Token = await Token.deploy(...tokenConstrucutorArgs);
    const tokenAddress = await token.getAddress();

    console.log(`🍥 Token deployed at ${tokenAddress} by ${await owner1Wallet.getAddress()}`);

    // TokenLock
    const tokenLockConstructorArgs = [
      tokenAddress,
      safeAddress,
      safeAddress
    ];

    const TokenLock = await ethers.getContractFactory("TokenLock", owner1Wallet);
    const tokenLock: TokenLock = await TokenLock.deploy(...tokenLockConstructorArgs);
    const tokenLockAddress = await tokenLock.getAddress();

    console.log(`🍥 TokenLock has been deployed at ${tokenLockAddress} by ${await owner1Wallet.getAddress()}`);

    // Mint all supply to safeAddress
    const decimals = await token.connect(owner1Wallet).decimals();

    const mintAmount = ethers.parseUnits("69420", decimals);

    const mintTxData = token.interface.encodeFunctionData(
      "mint",
      [safeAddress, mintAmount]
    );

    const safeTxDataMint: MetaTransactionData = {
      to: await token.getAddress(),
      value: "0",
      data: mintTxData
    };

    await sendMultiSigTx(safeTxDataMint);
    console.log(`🍥 Minted max supply to safeAddress - ${await token.connect(owner1Wallet).balanceOf(safeAddress)}`);

    // Approve infinite amount to TokenLock
    const approveTx = token.interface.encodeFunctionData(
      "approve",
      [tokenLockAddress, ethers.MaxUint256]
    )

    const safeTxDataApprove: MetaTransactionData = {
      to: tokenAddress,
      value: '0',
      data: approveTx
    };

    await sendMultiSigTx(safeTxDataApprove);
    console.log(`🍥 Approved max amount: owner - safeAddress, spender - TokenLock`);

    return {
      safe: safeList,
      token,
      tokenLock
    };
  }

  describe("Deployment", function () {
    it("Should safeAddress hold initial fund", async function () {
      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();

      expect(await ethers.provider.getBalance(safeAddress)).to.greaterThan(0);
    });

    it("Should Token owner match the safe address", async function () {
      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();
      
      expect(await this.token.connect(owner1Wallet).getOwner()).to.equal(safeAddress);
    });

    it("Should TokenLock match constructor args", async function () {
      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();
      const tokenAddress = await this.token.getAddress();

      expect(await this.tokenLock.connect(owner1Wallet).getOwner()).to.equal(safeAddress);
      expect(await this.tokenLock.connect(owner1Wallet).getToken()).to.equal(tokenAddress);
      expect(await this.tokenLock.connect(owner1Wallet).getBeneficiary()).to.equal(safeAddress);
    });

    it("Should mint be reverted by a non-owner", async function () {
      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();
      const decimals = await this.token.decimals();

      await expect(this.token.connect(owner1Wallet).mint(safeAddress, ethers.parseUnits('1', decimals))).to.be.revertedWithCustomError(
        this.token,
        "OwnableUnauthorizedAccount"
      ).withArgs(await owner1Wallet.getAddress());
    });
  });

  describe("TokenLock features", async function() {
    it("Should revert non-owner lock", async function() {
      const { token, tokenLock } = await loadFixture(deployContractsFixture);
      const decimals = await token.connect(owner1Wallet).decimals();
      
      const unitAmount = ethers.parseUnits("50", decimals);

      const currentTimestamp = await time.latest();
      const releaseTime = currentTimestamp + 24 * 12 * 60;

      await expect(tokenLock.connect(owner1Wallet).lock(
        unitAmount,
        releaseTime
      )).to.be.revertedWithCustomError(
        this.tokenLock,
        "OwnableUnauthorizedAccount"
      ).withArgs(await owner1Wallet.getAddress());
    });

    it("Should safeAddress be able to lock", async function() {
      const decimals = await this.token.connect(owner1Wallet).decimals();

      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();
      console.log(`safeAddress balance - ${await this.token.connect(owner1Wallet).balanceOf(safeAddress)}`);

      const unitAmount = ethers.parseUnits("50", decimals);

      const currentTimestamp = await time.latest();
      const releaseTime = currentTimestamp + 24 * 60 * 60; // 1 day
      
      const lockTxData = this.tokenLock.interface.encodeFunctionData(
        "lock",
        [unitAmount, BigInt(`${releaseTime}`)]
      );

      const safeTxData: MetaTransactionData = {
        to: await this.tokenLock.getAddress(),
        value: "0",
        data: lockTxData
      };

      await expect(sendMultiSigTx(safeTxData)).to.be.emit(this.tokenLock, "TokenLocked").withArgs(unitAmount, releaseTime);
      expect(await this.token.connect(owner1Wallet).balanceOf(this.tokenLock)).to.be.equal(unitAmount);
    });

    it("Should safeAddress be able to lock multiple times", async function() {
      const currentTimestamp = await time.latest();
      
      await lock(this.token, this.tokenLock, "50", BigInt(currentTimestamp + 24 * 60 * 60));
      await lock(this.token, this.tokenLock, "25", BigInt(currentTimestamp + 12 * 60 * 60));

      const locks = await this.tokenLock.connect(owner1Wallet).getLocks();
      expect(locks.length).to.be.equal(2);
    });

    it("Should revert for invalid release time", async function() {
      const decimals = await this.token.connect(owner1Wallet).decimals();
      const currentTimestamp = await time.latest();

      const unitAmount = ethers.parseUnits("10", decimals);
      const invalidReleaseTime = currentTimestamp - 24 * 60 * 60;

      const lockTxData = this.tokenLock.interface.encodeFunctionData(
        "lock",
        [unitAmount, BigInt(`${invalidReleaseTime}`)]
      );

      const safeTxData: MetaTransactionData = {
        to: await this.tokenLock.getAddress(),
        value: "0",
        data: lockTxData
      };

      await expect(sendMultiSigTx(safeTxData)).to.be.revertedWith(
        "GS013"
      );
    });

    it("Should return valid active lock indices", async function() {
      const currentTimestamp = await time.latest();

      await lock(this.token, this.tokenLock, "50", BigInt(currentTimestamp + 24 * 60 * 60));
      await lock(this.token, this.tokenLock, "25", BigInt(currentTimestamp + 12 * 60 * 60));

      const locks = await this.tokenLock.getLocks();
      const activeIndices: bigint[] = [];

      console.log(`🔒 locks - ${locks}`);

      locks.map((lock, index) => {
        if(lock.amount != BigInt('0')) {
          activeIndices.push(BigInt(`${index}`));
        }
      });

      const callResultIndices = await this.tokenLock.getLockedIndices();

      expect(activeIndices).to.be.deep.equal(callResultIndices);
    });

    it("Should increase block timestamp by 13 hours", async function() { 

      const currentTimestamp = await time.latest();

      await ethers.provider.send("evm_increaseTime", [13 * 60 * 60]); // 13 hours
      await ethers.provider.send("evm_mine", []);
  
      const laterTimestamp = await time.latest();
      
      expect(laterTimestamp).to.be.greaterThanOrEqual(currentTimestamp + 13 * 60 * 60);
    });

    it("Should release fund for Locks where its releaseTime past block timestamp", async function() {
      const currentTimestamp = await time.latest();
      await lock(this.token, this.tokenLock, "50", BigInt(currentTimestamp + 24 * 60 * 60));
      await lock(this.token, this.tokenLock, "25", BigInt(currentTimestamp + 12 * 60 * 60));

      await ethers.provider.send("evm_increaseTime", [13 * 60 * 60]); // 13 hours
      await ethers.provider.send("evm_mine", []);

      const decimals = await this.token.decimals();
      const [safe1] = this.safe;
      const safeAddress = await safe1.getAddress();
      const unitAmount = ethers.parseUnits("25", decimals);
  
      const releaseTxData = this.tokenLock.interface.encodeFunctionData(
        "release"
      );
  
      const safeTxData: MetaTransactionData = {
        to: await this.tokenLock.getAddress(),
        value: '0',
        data: releaseTxData
      };
  
      await expect(sendMultiSigTx(safeTxData)).to.emit(this.tokenLock, "TokenReleased")
        .withArgs(safeAddress, unitAmount);    
    });

    it("Should revokeLock emit TokenLockRevoked event", async function() {
      const currentTimestamp = await time.latest();
      await lock(this.token, this.tokenLock, "50", BigInt(currentTimestamp + 24 * 60 * 60));
      await lock(this.token, this.tokenLock, "25", BigInt(currentTimestamp + 12 * 60 * 60));

      const decimals = await this.token.connect(owner1Wallet).decimals();
      const indicies = await this.tokenLock.connect(owner1Wallet).getLockedIndices();
      const index = indicies[0];

      const revokeLockTxData = this.tokenLock.interface.encodeFunctionData(
        "revokeLock",
        [index]
      );

      const safeTxData: MetaTransactionData = {
        to: await this.tokenLock.getAddress(),
        value: '0',
        data: revokeLockTxData
      };

      await expect(sendMultiSigTx(safeTxData)).to.emit(this.tokenLock, "TokenLockRevoked")
        .withArgs(index, ethers.parseUnits("50", decimals));
    });

    it("Should revokeAllLocks emit AllTokenLocksRevoked event", async function() {
      const decimals = await this.token.connect(owner1Wallet).decimals();

      const currentTimestamp = await time.latest();
      await lock(this.token, this.tokenLock, "50", BigInt(currentTimestamp + 24 * 60 * 60));
      await lock(this.token, this.tokenLock, "25", BigInt(currentTimestamp + 12 * 60 * 60));

      const revokeAllLocksTx = this.tokenLock.interface.encodeFunctionData(
        "revokeAllLocks"
      );

      const safeTxData: MetaTransactionData = {
        to: await this.tokenLock.getAddress(),
        value: '0',
        data: revokeAllLocksTx
      };

      await expect(sendMultiSigTx(safeTxData)).to.emit(this.tokenLock, "AllTokenLocksRevoked")
        .withArgs(ethers.parseUnits("75", decimals));
    });
    
  });
});
