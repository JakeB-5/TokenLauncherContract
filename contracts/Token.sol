// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";


interface ITokenFactory {
    function isApprovedImplementation(address impl) external view returns (bool);
}

contract Token is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    address public factory;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _tokenOwner,
        address _factory,
        address _feeRecipient
    ) public virtual initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init(_tokenOwner);
        __UUPSUpgradeable_init();

        factory = _factory;

        uint256 fee = _initialSupply / 100;
        if (fee == 0 && _initialSupply > 0 ) fee = 1;

        _mint(_tokenOwner, _initialSupply - fee);
        _mint(_feeRecipient, fee);
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }

    function mint(address to, uint256 amount) external onlyFactory {
        _mint(to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        require(
            ITokenFactory(factory).isApprovedImplementation(newImplementation),
            "Not approved implementation"
        );
    }

  function version() public virtual view returns (string memory) {
    return "v1";
  }
}
