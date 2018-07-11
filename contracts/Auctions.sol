pragma solidity ^0.4.2;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract Auctions is usingOraclize {
    /*
    An address should be able to post one auction at a time.
    Remove auction from address when its closed.
    */

    uint256[] auctionIds;

    struct AuctionData {
        address owner;
        bool isOpen;
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

        start(_duration, auctionId);
        auctions[auctionId] = AuctionData(_user, true);
    }

    // TODO: Change function name
    function start(uint256 _duration, uint256 _auctionId) private {
        string memory url = "json(https://e8a7212f.ngrok.io/api/v1/close_auction).auction_closed";
        string memory payload = strConcat('{"auction":', uint2str(_auctionId), '}');

        oraclize_query(_duration, "URL", url, payload);
    }

    function __callback(bytes32 _id, string _result) {
        require(msg.sender == oraclize_cbAddress());

        emit Response(_id, _result);

        uint uintResult = parseInt(_result);

        auctions[uintResult].isOpen = false;
    }

    function getQueryPrice() public returns(uint) {
        return oraclize_getPrice("URL");
    }

    function getAuctionStatus(uint _id) public returns(bool) {
        return auctions[_id].isOpen;
    }
}