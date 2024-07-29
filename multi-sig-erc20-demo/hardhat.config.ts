import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// tasks
import "./tasks/mint";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {}
  }
};

export default config;
