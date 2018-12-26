pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "./Token.sol";
import "./SaleAuction.sol";
import "zos-lib/contracts/Initializable.sol";

contract Auctions is Token {
    SaleAuction nft;

    event LogAuctionCreated(uint256 _auctionId);

    function initialize(address _owner) public initializer {
        Token.initialize(_owner);
        Ownable.initialize(_owner);
    }

    function createAuction(uint256 _duration, uint256 _horseId, uint256 _minimum) public payable {
        require(msg.sender == ownerOf(_horseId), "notTokenOwner");

        safeTransferFrom(msg.sender, nft, _horseId); // New owner is the contract.

        uint256 id = nft.createAuction.value(msg.value)(msg.sender, _duration, _horseId, _minimum);
        emit LogAuctionCreated(id);
    }

    function setSaleAuctionAddress(address _nft) public onlyOwner() {
        nft = SaleAuction(_nft);
    }
}