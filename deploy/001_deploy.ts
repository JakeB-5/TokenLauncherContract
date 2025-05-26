import {DeployFunction} from "hardhat-deploy/dist/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

const func: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { owner, feeRecipient } = await getNamedAccounts();

  const Token = await ethers.getContractFactory("Token");
  const tokenImpl = await upgrades.deployImplementation(Token, { kind: "uups" });

  const Factory = await ethers.getContractFactory("TokenFactory");
  const factory = await upgrades.deployProxy(
    Factory,
    [tokenImpl, feeRecipient],
    { kind: "uups"}
  );

  await factory.waitForDeployment();

  console.log("Token Impl: ", tokenImpl);
  console.log("TokenFactory: ", factory);

  //copy to share path
  const sharePath = path.resolve(__dirname, "..", "..", "token-launcher-shares");
  if (!fs.existsSync(sharePath)) {
    fs.mkdirSync(sharePath);
  }

  const writeArtifact = async (contractName: string) => {
    const artifact = await deployments.getExtendedArtifact(contractName);
    fs.writeFileSync(
      `${sharePath}/${contractName}.json`,
      JSON.stringify(artifact, null, 2) + "\n"
    );
  };

  await writeArtifact("Token");
  await writeArtifact("TokenFactory");

  fs.writeFileSync(
    `${sharePath}/addresses.json`,
    JSON.stringify({
      TokenFactory: factory,
      TokenImplementation: tokenImpl
    }, null, 2) + "\n"
  );
};


export default func
func.tags = ['TokenFactory']
