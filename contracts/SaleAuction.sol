pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Auctions.sol";

contract SaleAuction is ERC721Holder, Ownable {
    address core;

    constructor(address _core) public {
        core = _core;
    }

    function transferFrom(address _to, uint256 _tokenId) public {
        Auctions(core).safeTransferFrom(this, _to, _tokenId);
    }

    function setCore(address _core) public onlyOwner() {
        core = _core;
    }
}