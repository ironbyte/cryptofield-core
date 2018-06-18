pragma solidity ^0.4.2;

import "./CToken.sol";

contract Horse is CToken {
    uint32 stallionsAvailable = 1111;
    //uint256 mares = 6424;
    //uint256 colts = 1451;
    //uint256 fillies = 3451;

    /* @dev Keep track of ids, the type doesn't matter because we're just using it
    to get the length/ID */
    address[] buyerAddress;

    // @dev Maps each address to a list of ids to keep track of ownership.
    mapping(address => uint256[]) horsesInfo;

    function buyStallion(address _buyerAddress, string _bio, bytes32[14] _byteParams) public payable {
        require(stallionsAvailable > 0);
        /* @dev Just a just works to have an upgoing value of ids starting from 1 up to 1111
        until the 'require' above is not longer met. */
        uint256 newHorseId = buyerAddress.push(_buyerAddress) - 1;
        // @dev Push the ID of the horse which was bought.
        horsesInfo[_buyerAddress].push(newHorseId);
        stallionsAvailable -= 1;

        /* bytes32[14] memory byteParams = [
            bytes32("Sundance Dancer"),
            bytes32("Brown"),
            bytes32("Stallion"),
            bytes32("Some breed"),
            bytes32("Some running style"),
            bytes32("Some origin"),
            bytes32("Sire"),
            bytes32("Some rank"),
            bytes32("Some pedigree"),
            bytes32("Some parents"),
            bytes32("Some grandparents"),
            bytes32("some phenotypes"),
            bytes32("Some genotypes"),
            bytes32("None")
        ]; */

        // TODO: Can't use mint if the address isn't from the owner.
        // "mint" sends a Transfer event
        mint(
            newHorseId,
            _buyerAddress,
            _bio,
            _byteParams
        );
    }

    function getStallions(address _address) public view returns(uint256[]) {
        return horsesInfo[_address];
    }

    function getStallionsAvailable() public view returns(uint32) {
        return stallionsAvailable;
    }
}
