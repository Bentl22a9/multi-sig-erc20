import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// tasks
import "./tasks/mint";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "localhost",
  networks: {
    "localhost": {
      url: process.env.LOCAL_RPC_URL || ""
    },
    "base:sepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      chainId: 84352
    }
  }
};

export default config;
