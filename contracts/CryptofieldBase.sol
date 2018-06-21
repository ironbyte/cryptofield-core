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
        uint256 height; // Hands
        uint256 individualValue;
        uint256 totalValue;
        uint256 coverServiceFee;
        uint256 dateSold;
        uint256 amountOfTimesSold;

        uint256[] parents;
        uint256[] grandparents;
        uint256[] greatgrandparents;


        string bio;
        string previousOwner;
        string horseType;

        string[] phenotypes;
        string[] genotypes;

        bytes32 name;
        bytes32 color;
        bytes32 breed;
        bytes32 runningStyle;
        bytes32 origin;
        bytes32 gender;
        bytes32 rank;
        bytes32 pedigree;

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

    function buyStallion(address _buyerAddress, string _bio, uint256 _height, bytes32[8] _byteParams) public payable {
        require(stallionsAvailable > 0);

        /* @dev Just a counter to have an upgoing value of ids starting from 1 up to 1111
        until the 'require' above is not longer met. */
        uint256 newHorseId = counter.add(1);

        Horse memory horse = Horse({
            buyer: _buyerAddress,

            saleId: newHorseId,
            timestamp: now,
            height: _height,
            individualValue: 0.0, // Placeholder
            totalValue: 0.0, // Placeholder
            coverServiceFee: 0.0, // Placeholder
            dateSold: 0, // Should be changed to 'timestamp' the day its sold
            amountOfTimesSold: 0,

            parents: [], // If its a G1P then the horse has no fathers, sad.
            grandparents: [], // Same as above
            greatgrandparents: [], // Same as above

            bio: _bio,
            previousOwner: "", // G1P have no previous owner unless its bought from another user
            horseType: "G1P",

            phenotypes: [], // TODO: Discuss Phenotypes
            genotypes: [], // TODO: Discuss Genotypes

            name: _byteParams[0],
            color: _byteParams[1],
            breed: _byteParams[2],
            runningStyle: _byteParams[3],
            origin: _byteParams[4],
            gender: _byteParams[5],
            rank: _byteParams[6],
            pedigree: _byteParams[7]
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

    function getHorse(uint256 _horseId) public view returns(bytes32, bytes32) {
        require(_horseId < horses.length);

        Horse memory horse = horses[_horseId];

        return (horse.name, horse.runningStyle);
    }
}
