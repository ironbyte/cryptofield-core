pragma solidity ^0.4.2;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract CToken is ERC721BasicToken, ERC721Token, Ownable {
    constructor() ERC721Token("CToken", "CT") public {
        owner = msg.sender;
    }

    // Mapping for owned address to horse IDs
    mapping(address => uint256[]) ownedHorses;

    // Mapping from horse ID to index.
    mapping(uint256 => uint256) ownedHorsesIndex;

    /* @dev Returns an array of ids of horses owned by '_from' */
    function _getHorsesOwned(address _from) public returns(uint256[]) {
        return ownedHorses[_from];
    }

    /*
    @param _byteParams is just a list with the elements from the struct so we don't run into compile errors.
    for having a stack too deep.
    Check if the size of the array is always 14 by comparing to struct elements. */
    function mint(address _sender, uint256 _horseId) public {
        _mint(_sender, _horseId);
    }

    /* @dev adds horse to list of owned horses by an address
    Throws if the horse already exists on the user list. */
    function _addHorse(address _to, uint256 _horseId) public onlyOwnerOf(_horseId) {
        uint256 length = ownedHorses[_to].length;
        ownedHorses[_to].push(_horseId);
        ownedHorsesIndex[_horseId] = length;
    }

    /* @dev We're implementing this functionality even though open-zepellin implements it
    because we don't have the option to retrieve all the tokens owned by an address from their framework.
    Throws if _from isn't the owner of _horseId */
    function _removeHorse(address _from, uint256 _horseId) public onlyOwnerOf(_horseId) {
        // We're just copying zepellin's implementation.
        uint256 tokenIndex = ownedHorsesIndex[_horseId];
        uint256 lastTokenIndex = ownedHorses[_from].length.sub(1);
        uint256 lastToken = ownedHorses[_from][lastTokenIndex];

        ownedHorses[_from][tokenIndex] = lastToken;
        ownedHorses[_from][lastTokenIndex] = 0;
        // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
        // be zero. Then we can make sure that we will remove _horseId from the ownedHorses list since we are first swapping
        // the lastToken to the first position, and then dropping the element placed in the last position of the list

        ownedHorses[_from].length--;
        ownedHorsesIndex[_horseId] = 0;
        ownedHorsesIndex[lastToken] = tokenIndex;
    }
}
