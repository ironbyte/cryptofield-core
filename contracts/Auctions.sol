pragma solidity ^0.4.2;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";
import "./CToken.sol";

contract Auctions is usingOraclize {
    uint256[] public auctionIds;
    address public ctoken;

    struct AuctionData {
        address owner;

        bool isOpen;

        uint256 duration;
        uint256 maxBid;
        uint256 horse;

        address maxBidder;
        address[] bidders;
        // Maps each address on this auction to a bid.
        mapping(address => uint256) bids;
    }

    mapping(uint256 => AuctionData) auctions;
    
    event Response(bytes32 id, string result);
    event Owner(address _owner);

    constructor(address _ctoken) public {
        OAR = OraclizeAddrResolverI(0xf0Bd23c643B420e399645fe54128A2E27915BdB9);
        ctoken = _ctoken;
    }

    function createAuction(uint256 _duration, uint256 _horseId) public payable {
        // We ensure that the value sent can cover the Query price for later usage.
        require(msg.value >= oraclize_getPrice("URL"));
        require(msg.sender == CToken(ctoken).ownerOfToken(_horseId));

        uint256 auctionId = auctionIds.push(0) - 1;

        AuctionData storage auction = auctions[auctionId];
        auction.owner = msg.sender;
        auction.isOpen = true;
        auction.duration = _duration;
        auction.horse = _horseId;

        sendAuctionQuery(_duration, auctionId);
    }

    /*
    @dev We construct the query with the auction ID and duration of it.
    */
    function sendAuctionQuery(uint256 _duration, uint256 _auctionId) private {
        string memory url = "json(https://e075b353.ngrok.io/api/v1/close_auction).auction_closed";
        string memory payload = strConcat("{\"auction\":", uint2str(_auctionId), "}");

        oraclize_query(_duration, "URL", url, payload);
    }

    /*
    @dev Only one Query is being sent, when we get a response back we automatically
    close the given auction.
    */
    function __callback(bytes32 _id, string _result) public {
        require(msg.sender == oraclize_cbAddress());

        emit Response(_id, _result);

        uint uintResult = parseInt(_result);

        auctions[uintResult].isOpen = false;
    }

    /*
    @dev bid function when an auction is created
    */
    function bid(uint256 _auctionId, uint256 _horseId) public payable returns(bool) {
        AuctionData storage auction = auctions[_auctionId];

        require(auction.isOpen);
        // You can only record another bid if it is higher than the previous one.
        require(msg.value > auction.maxBid);

        auction.bids[msg.sender] += msg.value;
        auction.bidders.push(msg.sender);
        auction.maxBid = msg.value;
        auction.maxBidder = msg.sender;

        return true;
    }

    // Withdrawals need to be manually triggered.
    function withdraw(uint256 _auctionId) public returns(bool) {
        AuctionData storage auction = auctions[_auctionId];
        require(!auction.isOpen);

        uint256 payout;

        if(msg.sender == auction.owner) {
            payout = auction.maxBid;
            auction.maxBid = 0;
        }

        // We ensure the msg.sender isn't the max bidder nor the owner.
        // If the address is the owner that would evaluate to true two times (above and this one) and 'payout' wouldn't be correct.
        if(msg.sender != auction.maxBidder && msg.sender != auction.owner) {
            payout = auction.bids[msg.sender];
            auction.bids[msg.sender] = 0;
        }

        if(msg.sender == auction.maxBidder) {
            // TODO: Send horse to winner
        }

        msg.sender.transfer(payout);
        return true;
    }

    /*
    @return Returns the price of the Query so the contract has enough Ether when the query is sent.
    */
    function getQueryPrice() public returns(uint) {
        return oraclize_getPrice("URL");
    }

    /* 
    @dev Check if an auction is open or closed by a given ID.
    */
    function getAuctionStatus(uint256 _id) public view returns(bool) {
        return auctions[_id].isOpen;
    }

    /*
    @dev Just returns the length of all the auctions created for enumeration and tests.
    */
    function getAuctionsLength() public view returns(uint) {
        return auctionIds.length;
    }

    /*
    @dev Gets the duration of a given auction.
    */  
    function getAuctionDuration(uint256 _id) public view returns(uint256) {
        AuctionData memory auction = auctions[_id];

        return auction.duration;
    }
}