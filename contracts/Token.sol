pragma solidity 0.4.24;

import "./ERC721Token.sol";
import "./CryptofieldBase.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

contract Token is CryptofieldBase, ERC721Token, ERC721Holder {
    using SafeMath for uint256;

    // Variable for enumeration.
    uint256[] addresses;

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
    function createOffspring(address _owner, string _hash, uint256 _male, uint256 _female) external payable returns(uint256) {
        uint256 tokenId = allTokensLength();

        _mint(_owner, tokenId);
        buyOffspring(_owner, _hash, tokenId, _male, _female);

        return tokenId;
    }

    /*
    @dev Creates a G1P.
    @dev Mostly used for Private and public sales to calculate genotypes.
    */
    function createGOP(address _owner, string _hash) public payable returns(uint256) {
        uint256 tokenId = allTokensLength();
        uint256 genotype;

        require(tokenId <= 38000, "Horse cap met");
        
        if(tokenId >= 0 && tokenId <= 100) {
            genotype = 1;
        } else if(tokenId >= 101 && tokenId <= 300) {
            genotype = 2;
        } else if(tokenId >= 301 && tokenId <= 600) {
            genotype = 3;
        } else if(tokenId >= 601 && tokenId <= 1000) {
            genotype = 4;
        } else if(tokenId >= 1001 && tokenId <= 2000) {
            genotype = 5;
        } else if(tokenId >= 2001 && tokenId <= 4000) {
            genotype = 6;
        } else if(tokenId >= 4001 && tokenId <= 8000) {
            genotype = 7;
        } else if(tokenId >= 8001 && tokenId <= 16000) {
            genotype = 8;
        } else if(tokenId >= 16001 && tokenId <= 26000) {
            genotype = 9;
        } else {
            genotype = 10;
        }

        _mint(_owner, tokenId);
        buyGOP(_owner, _hash, tokenId, genotype);

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
}
