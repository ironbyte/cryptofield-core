pragma solidity ^0.4.2;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract Auctions is usingOraclize {
    /*
    An address should be able to post one auction at a time.
    Remove auction from address when its closed.
    */

    uint256[] public auctionIds;

    struct AuctionData {
        address owner;
        bool isOpen;
        uint256 duration;
    }

    mapping(uint256 => AuctionData) auctions;

    event Response(bytes32 id, string result);

    constructor() public payable {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }

    function createAuction(address _user, uint256 _duration) public payable {
        // We ensure that the value sent can cover the Query price for later usage.
        require(msg.value >= oraclize_getPrice("URL"));

        uint256 auctionId = auctionIds.push(0) - 1;

        sendAuctionQuery(_duration, auctionId);
        auctions[auctionId] = AuctionData(_user, true, _duration);
    }

    /*
    @dev We construct the query with the auction ID and duration of it.
    */
    function sendAuctionQuery(uint256 _duration, uint256 _auctionId) private {
        string memory url = "json(https://375b0412.ngrok.io/api/v1/close_auction).auction_closed";
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
    @return Returns the price of the Query so the contract has enough Ether when the query is sent.
    */
    function getQueryPrice() public returns(uint) {
        return oraclize_getPrice("URL");
    }

    /* 
    @dev Check if an auction is open or closed by a given ID.
    */
    function getAuctionStatus(uint _id) public view returns(bool) {
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