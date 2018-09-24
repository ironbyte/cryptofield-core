pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Token.sol";
import "./SaleAuction.sol";

contract Auctions is Token {
    SaleAuction nft;

    event LogAuctionCreated(uint256 _auctionId);

    function createAuction(uint256 _duration, uint256 _horseId, uint256 _minimum) public payable {
        require(msg.sender == ownerOf(_horseId), "notTokenOwner");

        // approves the SaleAuction contract to transfer the token.
        approve(nft, _horseId);

        uint256 id = nft.createAuction.value(msg.value)(msg.sender, _duration, _horseId, _minimum);
        emit LogAuctionCreated(id);
    }

    // TODO: CHANGE FUNCTION NAME
    function setNft(address _nft) public onlyOwner() {
        nft = SaleAuction(_nft);
    }
}