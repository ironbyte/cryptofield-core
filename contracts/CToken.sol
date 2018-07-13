pragma solidity ^0.4.2;

import "./ERC721Token.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol";

contract CToken is ERC721BasicToken, ERC721Token {
    constructor() ERC721Token("CToken", "CT") public {
    }

    // Mapping for owned address to horse IDs
    mapping(address => uint256[]) ownedHorses;

    // Mapping from horse ID to index.
    mapping(uint256 => uint256) ownedHorsesIndex;

    /* @dev Returns an array of ids of horses owned by '_from' */
    function _getHorsesOwned(address _from) public view returns(uint256[]) {
        return getOwnedTokens(_from);
    }

    function mint(address _sender, uint256 _tokenId) public {
        _mint(_sender, _tokenId);
    }

    function _transferTo(address _from, address _to, uint256 _tokenId) public {
        approve(_to, _tokenId);
        safeTransferFrom(_from, _to, _tokenId);
    }

    function _ownerOf(uint256 _tokenId) public view returns(address) {
        return ownerOf(_tokenId);
    }
}
