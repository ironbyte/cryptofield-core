pragma solidity ^0.4.2;

import './ERC721Token.sol';
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
    function _getHorsesOwned(address _from) public view returns(uint256[]) {
        return getOwnedTokens(_from);
    }

    function mint(address _sender, uint256 _horseId) public {
        _mint(_sender, _horseId);
    }

    function _transferTo(address _from, address _to, uint256 _horseId) public {
        approve(_to, _horseId);
        safeTransferFrom(_from, _to, _horseId);
    }
}
