import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  namedAccounts: {
    owner: { default: 0},
    feeRecipient: { default: 1 },
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  }
};

export default config;
