// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

interface IToken {
  function initialize(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply,
    address _tokenOwner,
    address _factory,
    address _feeRecipient
  ) external;
}

contract TokenFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {
  address public feeRecipient;
  address public tokenImplementation;

  mapping(address => bool) public approvedImplementations;

  event TokenCreated(address indexed token, address indexed owner, string name, string symbol, uint256 initialSupply);


  function initialize(address _tokenImplementation, address _feeRecipient) public initializer {
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();

    tokenImplementation = _tokenImplementation;
    approvedImplementations[_tokenImplementation] = true;
    feeRecipient = _feeRecipient;
  }

  function createToken(
    string memory name,
    string memory symbol,
    uint256 initialSupply
  ) external returns (address) {
    bytes memory initData = abi.encodeWithSelector(
      IToken.initialize.selector,
      name,
      symbol,
      initialSupply,
      msg.sender,
      address(this),
      feeRecipient
    );

    ERC1967Proxy proxy = new ERC1967Proxy(tokenImplementation, initData);

    emit TokenCreated(address(proxy), msg.sender, name, symbol, initialSupply);

    return address(proxy);
  }

  function isApprovedImplementation(address impl) external view returns (bool) {
    return approvedImplementations[impl];
  }

  function approveImplementation(address impl, bool approved) external onlyOwner {
    approvedImplementations[impl] = approved;
  }

  function updateImplementation(address newImplementation) external onlyOwner {
    tokenImplementation = newImplementation;
    approvedImplementations[newImplementation] = true;
  }

  function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
    feeRecipient = newFeeRecipient;
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
    require(approvedImplementations[newImplementation], "TokenFactory: Implementation not approved");
  }
}
