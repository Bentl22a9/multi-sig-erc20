import { task } from "hardhat/config";

task("mint", "Mint some amount of token to an address")
    .addParam("amount", "The amount to mint")
    .addParam("address", "The receiver address")
    .setAction(async (taskArgs, hre) => {
        const { mint } = await import("../scripts/mint");
        await mint({ amount: taskArgs.amount, address: taskArgs.address  });
    });