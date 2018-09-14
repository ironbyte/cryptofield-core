pragma solidity 0.4.24;

import "./ERC721Token.sol";
import "./CryptofieldBase.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

contract Token is CryptofieldBase, ERC721Token, ERC721Holder {
    using SafeMath for uint256;

    address gopcreator;

    constructor() ERC721Token("Zed Token", "ZT") public {}

    modifier ownerOfToken(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        _;
    }

    modifier onlyApprovedOrOwner(uint256 _tokenId) {
        require(isApprovedOrOwner(msg.sender, _tokenId), "Not owner or approved");
        _;
    }

    /*
    @dev Simply creates a new token and calls base contract to add the horse information.
    @dev Used for offsprings mostly, called from 'Breeding'
    */
    function createOffspring(address _owner, string _hash, uint256 _male, uint256 _female) 
    external
    payable
    onlyBreeding() 
    returns(uint256) {
        uint256 tokenId = allTokensLength();

        _mint(_owner, tokenId);
        buyOffspring(_owner, _hash, tokenId, _male, _female);

        return tokenId;
    }

    /*
    @dev Creates a G1P.
    @dev Mostly used for Private and public sales to calculate genotypes.
    */
    function createGOP(address _owner, string _hash, uint256 _batchNumber) 
    public 
    payable
    returns(uint256) {
        require(msg.sender == gopcreator, "Not authorized");
        uint256 tokenId = allTokensLength();
        uint256 baseValue;

        if(_batchNumber == 1) {
            baseValue = _getRandom(4, 100);
        } else if(_batchNumber == 2) {
            baseValue = _getRandom(9, 90);
        } else if(_batchNumber == 3) {
            baseValue = _getRandom(4, 80);
        } else if(_batchNumber == 4) {
            baseValue = _getRandom(4, 75);
        } else if(_batchNumber == 5) {
            baseValue = _getRandom(9, 70);
        } else if(_batchNumber == 6) {
            baseValue = _getRandom(4, 60);
        } else if(_batchNumber == 7) {
            baseValue = _getRandom(9, 50);
        } else if(_batchNumber == 8) {
            baseValue = _getRandom(9, 40);
        } else if(_batchNumber == 9) {
            baseValue = _getRandom(9, 30);
        } else {
            baseValue = _getRandom(19, 20);
        }

        _mint(_owner, tokenId);
        buyGOP(_owner, _hash, tokenId, _batchNumber, baseValue);

        return tokenId;
    }

    /*
    @dev Sets the name of a horse manually, this should be done only once.
    */
    function setName(string _name, uint256 _tokenId) public ownerOfToken(_tokenId) {
        setNameFor(_name, _tokenId);
    }

    // Check if an address has been granted approval of a token.
    function isTokenApproved(address _spender, uint256 _tokenId) public view returns(bool) {
        return super.isApprovedOrOwner(_spender, _tokenId);
    }

    /*
    @dev Calls the 'horseSold' function after applying the modifier.
    */
    function tokenSold(uint256 _tokenId) external onlyApprovedOrOwner(_tokenId) {
        horseSold(_tokenId);
    }

    /*
    @dev Returns whether a horse exists or not.
    */
    function exists(uint256 _tokenId) public view returns(bool) {
        return _tokenId <= allTokensLength();
    }

    /*  RESTRICTED  */

    function setGOPCreator(address _addr) public onlyOwner() {
        gopcreator = _addr;
    }

    function _getRandom(uint256 _num, uint256 _deleteFrom) private returns(uint256) {
        uint256 rand = uint256(blockhash(block.number.sub(1))) % _num + 1;

        return _deleteFrom - rand;
    }
}
