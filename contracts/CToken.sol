pragma solidity ^0.4.2;

import "./ERC721Token.sol";
import "./CryptofieldBase.sol";

contract CToken is CryptofieldBase, ERC721Token {
    uint256 stallionsAvailable = 168;
    uint256 maresAvailable = 379;
    uint256 coltsAvailable = 230;
    uint256 filliesAvailable =  334;

    // Variable for enumeration.
    address[] addresses;

    constructor() ERC721Token("CToken", "CT") public {}

    /* @dev Returns an array of ids of horses owned by '_from' */
    function getOwnedTokens(address _from) public view returns(uint256[]) {
        return super.getOwnedTokens(_from);
    }

    function createStallion(address _sender, string _hash) public payable {
        require(stallionsAvailable > 0);

        uint256 tokenId = addresses.push(_sender) - 1;

        _mint(_sender, tokenId);
        buyStallion(_sender, _hash);

        stallionsAvailable -= 1;
    }

    function transferTo(address _from, address _to, uint256 _tokenId) public {
        approve(_to, _tokenId);
        safeTransferFrom(_from, _to, _tokenId);
    }

    // function ownerOfToken(uint256 _tokenId) public view returns(address) {
    //     return ownerOf(_tokenId);
    // }
}
