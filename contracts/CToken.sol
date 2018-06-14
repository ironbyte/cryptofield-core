pragma solidity ^0.4.2;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract CToken is ERC721Token, Ownable {
    constructor() ERC721Token("CToken", "CT") public {
        owner = msg.sender;
    }

    // TODO: Check value types from this struct.
    struct Horse {
        uint256 saleId;
        uint256 timestamp;
        string bio;
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
        bytes32 phenotypes;
        bytes32 genotypes;
        bytes32 previousOwner;
        address buyer;
    }

    Horse[] horses;

    /*
    @param _byteParams is just a list with the elements from the struct so we don't run into compile errors.
    for having a stack too deep.
    Check if the size of the array is always 14 by comparing to struct elements. */
    function mint(uint256 _saleId, address _buyer, string _bio, bytes32[14] _byteParams) public onlyOwner {
        Horse memory horse = Horse({
            saleId: _saleId,
            timestamp: now,
            bio: _bio,
            buyer: _buyer,
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
            phenotypes: _byteParams[11],
            genotypes: _byteParams[12],
            previousOwner: _byteParams[13]
        });

        uint horseId = horses.push(horse) - 1;

        _mint(msg.sender, horseId);
    }

    function _getHorse(uint256 _horseId) public view returns(string) {
        Horse memory horse = horses[_horseId];

        return (horse.bio);
    }
}
