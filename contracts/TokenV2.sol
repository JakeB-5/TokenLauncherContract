// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Token.sol";

contract TokenV2 is Token {

  function initialize(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply,
    address _tokenOwner,
    address _factory,
    address _feeRecipient
  ) public reinitializer(2) override {
    super.initialize(_name, _symbol, _initialSupply, _tokenOwner, _factory, _feeRecipient);
  }

  function version() public override view returns (string memory) {
    return "v2";
  }
}
