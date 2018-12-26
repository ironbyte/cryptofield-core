pragma solidity ^0.4.24;

import "./StudService.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";

/*
Core contract, it inherits from the last contract.
*/
contract Core is Ownable, StudService {
    function initialize(address _owner) public initializer {
        StudService.initialize(_owner);
        Ownable.initialize(_owner);
    }
}