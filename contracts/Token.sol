pragma solidity 0.4.24;

import "./ERC721Token.sol";
import "./CryptofieldBase.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

contract Token is CryptofieldBase, ERC721Token, ERC721Holder, Ownable {
    using SafeMath for uint256;

    uint256 stallionsAvailable = 168;
    uint256 maresAvailable = 379;
    uint256 coltsAvailable = 230;
    uint256 filliesAvailable =  334;

    // Variable for enumeration.
    address[] addresses;

    constructor() ERC721Token("CToken", "CT") public {
        owner = msg.sender;
    }

    /*
    @dev Simply creates a new token and calls base contract to add the horse information.
    */
    function createHorse(address _owner, string _hash) external payable {
        uint256 tokenId = addresses.push(_owner) - 1;

        _mint(_owner, tokenId);
        buyHorse(_owner, _hash);
    }

    // Check if an address has been granted approval of a token.
    function isTokenApproved(address _spender, uint256 _tokenId) public view returns(bool) {
        return super.isApprovedOrOwner(_spender, _tokenId);
    }

    /*
    @dev Transfers a token of '_from' to '_to'
    */
    function tokenSold(address _from, address _to, uint256 _tokenId) public {
        super.safeTransferFrom(_from, _to, _tokenId);
        horseSold(_tokenId);
    }
}
