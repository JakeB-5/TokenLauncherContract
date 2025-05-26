/// <reference types="hardhat" />
import {expect} from "chai";
import {ethers, upgrades} from "hardhat";

describe('TokenFactory + Token', () => {
  let owner: any, user: any, feeRecipient: any;
  let tokenImplementation: any;
  let token: any;
  let factory: any;


  const initialSupply = ethers.parseUnits("1000", 18);

  beforeEach(async () => {
    [owner, user, feeRecipient] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    tokenImplementation = await upgrades.deployImplementation(Token, {kind: "uups"});

    const Factory = await ethers.getContractFactory("TokenFactory");
    factory = await upgrades.deployProxy(Factory, [tokenImplementation, feeRecipient.address], {
      kind: "uups",
    });
  });

  it("should create token and distribute fee", async function () {
    const tx = await factory.connect(user).createToken("TestToken", "TTK", initialSupply);
    const receipt = await tx.wait();
    const proxyAddress = receipt.logs.find((l: any) => l.fragment?.name === "TokenCreated")?.args?.token;

    const token = await ethers.getContractAt("Token", proxyAddress);

    const userBalance = await token.balanceOf(user.address);
    const feeBalance = await token.balanceOf(feeRecipient.address);

    const expectedFee = initialSupply / BigInt(100);
    expect(userBalance).to.equal(initialSupply - expectedFee);
    expect(feeBalance).to.equal(expectedFee);
  });
  it("only factory can mint", async function () {
    const tx = await factory.connect(user).createToken("MintTest", "MINT", initialSupply);
    const receipt = await tx.wait();
    const proxyAddress = receipt.logs.find((l: any) => l.fragment?.name === "TokenCreated")?.args?.token;

    token = await ethers.getContractAt("Token", proxyAddress);

    const userAddress = await user.getAddress();

    // ONLY factory should be able to mint
    // owner (factory owner) trying to mint directly on token
    await expect(token.connect(owner).mint(userAddress, 100)).to.be.revertedWith("Only factory can call");

    // user (not factory) trying to mint directly on token
    await expect(token.connect(user).mint(userAddress, 100)).to.be.revertedWith("Only factory can call");

  });
  it("owner can upgrade token to approved implementation", async function () {
    const tx = await factory.connect(user).createToken("UpgradeTest", "UPG", initialSupply);
    const receipt = await tx.wait();
    const proxyAddress = receipt.logs.find((l: any) => l.fragment?.name === "TokenCreated")?.args?.token;

    const token = await ethers.getContractAt("Token", proxyAddress);

    const TokenV2 = await ethers.getContractFactory("TokenV2");
    const newImpl = await upgrades.deployImplementation(TokenV2, {kind: "uups"});

    // owner registers new implementation
    await factory.connect(owner).updateImplementation(newImpl);

    await expect(upgrades.upgradeProxy(token, TokenV2)).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

    const upgraded = await upgrades.upgradeProxy(token.connect(user), TokenV2.connect(user) );

    expect(await upgraded.version()).to.equal("v2");
  });
  it("should revert if upgrading to unapproved implementation", async function () {
    const tx = await factory.connect(user).createToken("UnapprovedUpgrade", "BAD", initialSupply);
    const receipt = await tx.wait();
    const proxyAddress = receipt.logs.find((l: any) => l.fragment?.name === "TokenCreated")?.args?.token;
    const token = await ethers.getContractAt("Token", proxyAddress);

    const TokenV2 = await ethers.getContractFactory("TokenV2");
    const newImpl = await upgrades.deployImplementation(TokenV2, {kind: "uups"});

    // not approved
    await expect(upgrades.upgradeProxy(token.connect(user),TokenV2.connect(user))).to.be.revertedWith(
      "Not approved implementation"
    );
  });
});
