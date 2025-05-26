import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  }
};

export default config;
