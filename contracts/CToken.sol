pragma solidity ^0.4.2;

import "./ERC721Token.sol";
import "./CryptofieldBase.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CToken is ERC721Token, Ownable {
    using SafeMath for uint256;

    uint256 stallionsAvailable = 168;
    uint256 maresAvailable = 379;
    uint256 coltsAvailable = 230;
    uint256 filliesAvailable =  334;

    // Variable for enumeration.
    address[] addresses;
    address cryptofieldBase;
    address auctions;

    constructor(address _cryptofieldBase) ERC721Token("CToken", "CT") public {
        cryptofieldBase = _cryptofieldBase;
        owner = msg.sender;
    }

    function setAuctions(address _auctions) public onlyOwner() {
        auctions = _auctions;
    }

    /* @dev Returns an array of ids of horses owned by '_from' */
    function getOwnedTokens(address _from) public view returns(uint256[]) {
        return super.getOwnedTokens(_from);
    }

    /*
    @dev Simply creates a new token and calls base contract to add the horse information.
    */
    function createHorse(address _owner, string _hash) public payable {
        uint256 tokenId = addresses.push(_owner) - 1;

        _mint(_owner, tokenId);
        CryptofieldBase(cryptofieldBase).buyHorse(_owner, _hash);
    }

    // @dev Safely transfer  token from the current owner to another address
    function transferTokenTo(address _from, address _to, uint256 _tokenId) public {
        safeTransferFrom(_from, _to, _tokenId);
    }

    // @dev returns owner of a token
    function ownerOfToken(uint256 _tokenId) public view returns(address) {
        return ownerOf(_tokenId);
    }

    // @dev Approves the auctions contract to transfer the given token,
    // that way we can use the address of the contract to perform that transaction when 
    // transfering ownership of a token.
    function approveAuctions(uint256 _tokenId) public {
        approve(auctions, _tokenId);
    }

    // Check if an address has been granted approval of a token.
    function isTokenApproved(address _spender, uint256 _tokenId) public view returns(bool) {
        return isApprovedOrOwner(_spender, _tokenId);
    }

    /*
    @dev Transfers a token of '_from' to '_to'
    */
    function tokenSold(address _from, address _to, uint256 _tokenId) public {
        safeTransferFrom(_from, _to, _tokenId);
        CryptofieldBase(cryptofieldBase).horseSold(_tokenId);
    }

    /*
    @dev Transfer ownership of contract to a given address.
    */
    function giveOwnership(address _to) public onlyOwner() {
        transferOwnership(_to);
    }
}
