// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20Capped, Ownable {
    uint8 private _tokenDecimals;

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        uint8 _decimals,
        uint256 maxSupply
    ) ERC20(name, symbol) ERC20Capped(maxSupply) Ownable(owner) {
        _tokenDecimals = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return _tokenDecimals;
    }

    // @dev
    function getOwner() public view returns (address) {
        return owner();
    }

    function mint(address to, uint256 amount) public onlyOwner() {
        _mint(to, amount);
    }
}