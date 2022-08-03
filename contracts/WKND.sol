// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WKND is ERC20 {
    constructor(uint256 initialSupply) ERC20("Wakanda", "WKND") {
        _mint(msg.sender, initialSupply);
    }
}
