pragma solidity ^0.4.2;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import "./CToken.sol";

contract CryptofieldBase is ERC721BasicToken, CToken {
    using SafeMath for uint256;

    uint256 stallionsAvailable = 1111;

    /* TODO: 1. Check value types from this struct.
    2. Add Phenotypes and Genotypes fields
    @dev 'timestamp' is used to calculate the age of the horse. */
    struct Horse {
        address buyer;

        uint256 saleId;
        uint256 timestamp;

        string bio;
        string height;

        bytes32 name;
        bytes32 color;
        bytes32 horseType;
        bytes32 breed;
        bytes32 runningStyle;
        bytes32 origin;
        bytes32 gender;
        bytes32 rank;
        bytes32 pedigree;
        bytes32 parents;
        bytes32 grandparents;
        bytes32 greatgrandparents;
        bytes32 previousOwner;
    }

    Horse[] horses;

    // Counter for Ids
    uint256 counter;

    // Mapping for owned address to horse IDs
    mapping(address => uint256[]) ownedHorses;

    // Mapping from horse ID to index.
    mapping(uint256 => uint256) ownedHorsesIndex;

    // Mapping horse Ids to addresses.
    mapping(uint256 => address) horseOwner;

    function buyStallion(address _buyerAddress, string _bio, string _height, bytes32[14] _byteParams) public payable {
        require(stallionsAvailable > 0);

        /* @dev Just a counter to have an upgoing value of ids starting from 1 up to 1111
        until the 'require' above is not longer met. */
        uint256 newHorseId = counter.add(1);

        Horse memory horse = Horse({
            saleId: newHorseId,
            buyer: _buyerAddress,
            timestamp: now,
            bio: _bio,
            height: _height,
            name: _byteParams[0],
            color: _byteParams[1],
            horseType: _byteParams[2],
            breed: _byteParams[3],
            runningStyle: _byteParams[4],
            origin: _byteParams[5],
            gender: _byteParams[6],
            rank: _byteParams[7],
            pedigree: _byteParams[8],
            parents: _byteParams[9],
            grandparents: _byteParams[10],
            greatgrandparents: _byteParams[11],
            previousOwner: _byteParams[12]
        });

        horses.push(horse);

        stallionsAvailable.sub(1);

        // Maps the horse ID to an address.
        _addHorse(_buyerAddress, newHorseId);

        // "mint" sends a Transfer event
        mint(msg.sender, newHorseId);
    }

    /* @param _from user from where we're retrieving the list of horses owned
    @return uint256[] list of owned horses */
    function getHorsesOwned(address _from) public view returns(uint256[]) {
        return _getHorsesOwned(_from);
    }

    function getStallionsAvailable() public view returns(uint256) {
        return stallionsAvailable;
    }

    function getHorse(uint256 _horseId) public view returns(bytes32, bytes32, bytes32) {
        require(_horseId < horses.length);

        Horse memory horse = horses[_horseId];

        return (horse.name, horse.horseType, horse.origin);
    }
}
