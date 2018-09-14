pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Core.sol";

/*
@dev Contract in charge of creating auctions for G1P horses
from 1 to 10, i.e. ZED 1 / ZED 10, having a lower genotype makes a horse rarer.
*/
contract GOPCreator is Ownable {
    using SafeMath for uint256;

    bool anyBatchOpen;

    uint256 currentOpenBatch;
    uint256[] gopsAuctionsList;

    Core core;

    struct GOP {
        uint256 createdAt;
        uint256 maxBid;
        uint256 minimum;

        uint256 gen;

        address maxBidder;
        address[] bidders;

        bool isOpen;

        string horseHash;

        mapping(address => uint256) bidFor;
        mapping(address => bool) exists;
    }

    mapping(uint256 => GOP) internal gopAuctions;
    mapping(uint256 => bool) internal isBatchOpen;
    mapping(uint256 => uint256) internal horsesForGen;
    mapping(uint256 => bool) internal firstHalfCompleted;
    mapping(address => uint256[]) internal auctionsParticipating;

    event LogGOPBid(address _owner, uint256 _amount);
    event LogGOPClaim(address _claimer);

    constructor(address _addr) public {
        owner = msg.sender;
        core = Core(_addr);

        // From 1 to 4 there will be 500 more available for later use.
        horsesForGen[1] = 1000;
        horsesForGen[2] = 1000;
        horsesForGen[3] = 1000;
        horsesForGen[4] = 1000;
        horsesForGen[5] = 2000;
        horsesForGen[6] = 3000;
        horsesForGen[7] = 4000;
        horsesForGen[8] = 6000;
        horsesForGen[9] = 90000;
        horsesForGen[10] = 10000;
    }

    /*
    @dev Manually opens a batch of horses.
    */
    function openBatch(uint256 _batch) public onlyOwner() {
        require(!anyBatchOpen, "A batch is already open");
        require(_batch >= 1 && _batch <= 10, "Gen not recognized");

        anyBatchOpen = true;
        currentOpenBatch = _batch;
    }

    /*
    @dev Closes a given batch, a batch needs to be closed first before opening another one, we allow
    only one batch open at a time.
    */
    function closeBatch(uint256 _batch) public onlyOwner() {
        delete isBatchOpen[_batch];
        delete anyBatchOpen;
        delete currentOpenBatch;
    }

    /*
    @dev  Depending of the batch open we're going to directly sell the horse or 
    put them in Auctions first, only owner can put the horse into Auctions.
    */
    function createGOP(address _owner, string _hash) public payable returns(uint256) {
        require(anyBatchOpen, "No batch open");
        require(horsesForGen[currentOpenBatch] != 0, "Cap for Gen specified already met");

        uint256 amount;
        uint256 horseId = core.createGOP(_owner, _hash, currentOpenBatch);

        if(horseId == 0) return horseId; 

        if(currentOpenBatch == 1 || currentOpenBatch == 5) amount = 0.40 ether;
        if(currentOpenBatch == 2) amount = 0.30 ether;
        if(currentOpenBatch == 3) amount = 0.25 ether;
        if(currentOpenBatch == 4) amount = 0.20 ether;
        if(currentOpenBatch == 6) amount = 0.38 ether;
        if(currentOpenBatch == 7) amount = 0.35 ether;
        if(currentOpenBatch == 8) amount = 0.33 ether;
        if(currentOpenBatch == 9) amount = 0.28 ether;
        if(currentOpenBatch == 10) amount = 0.25 ether;

        // There isn't a concern with sending 'amount' to 'owner' if the horse is going to Auction
        // because we return in this 'if' statement.
        if(currentOpenBatch >= 5 && currentOpenBatch <= 10) {
            require(msg.sender == owner, "Not owner");

            _createAuction(amount, _hash);

            return horseId;
        }

        // This is only needed in case the batch open is between 1 and 4 since they have a fixed price
        // otherwise we just put the hors einto auction and return.
        require(msg.value >= amount, "Price not met");

        horsesForGen[currentOpenBatch] = horsesForGen[currentOpenBatch].sub(1);

        // We're going to close the batch if the number of horses available hit 500
        // Only batches 1 to 4.
        // This will evaluate to 'true' only once because the next time we open this batch
        // 'horsesForGen' will not be 500 because the above assignment will put it on 499.
        if(currentOpenBatch >= 1 && currentOpenBatch <= 4 && horsesForGen[currentOpenBatch] == 500) {
            delete isBatchOpen[currentOpenBatch];
            delete anyBatchOpen;
            delete currentOpenBatch;
        }

        owner.transfer(msg.value);

        return horseId;
    }

    /*
    @dev The auction functionality here is the same as the logic in the 'SaleContract' used for 
    auctions from users.
    */
    function _createAuction(uint256 _minimum, string _hash) private {
        // TODO: Put Oraclize to one week.
        // TODO: Require for Oraclize query.
        uint256 id = gopsAuctionsList.push(1);

        GOP storage g = gopAuctions[id];
        g.createdAt = now;
        g.minimum = _minimum;
        g.isOpen = true;
        g.gen = currentOpenBatch;
        g.horseHash = _hash;
    }

    function bid(uint256 _auctionId) public payable {
        GOP storage a = gopAuctions[_auctionId];

        require(a.isOpen, "Auction not open");

        uint256 userBid = a.bidFor[msg.sender].add(msg.value);

        require(userBid > a.maxBid, "Bid lower than maximum bid");

        if(a.bidders.length == 0) {
            require(msg.value >= a.minimum, "Bid lower than minimum");
        }

        a.bidFor[msg.sender] = userBid;

        if(!a.exists[msg.sender]) {
            a.bidders.push(msg.sender);
            a.exists[msg.sender] = true;

            auctionsParticipating[msg.sender].push(_auctionId);
        }

        a.maxBid = userBid;
        a.maxBidder = msg.sender;

        emit LogGOPBid(msg.sender, userBid);
    }

    /*
    @dev Claim the price (Minted token), ether if user didn't win and maximum bid if the user is the owner.
    */
    function claim(uint256 _auction) public {
        // 'owner' doesn't get anything from here.
        GOP storage g = gopAuctions[_auction];

        require(!g.isOpen, "Auction still open");

        // Mints a token for the maxBidder.
        if(msg.sender == g.maxBidder) {
            core.createGOP(msg.sender, g.horseHash, g.gen);
            delete g.maxBidder;
        }

        // Transfer the maxBid to the owner.
        if(msg.sender == owner) {
            msg.sender.transfer(g.maxBid);
            delete g.maxBid;
        }

        // Sends money back to user if they didn't win.
        if(msg.sender != g.maxBidder && msg.sender != owner) {
            msg.sender.transfer(g.bidFor[msg.sender]);
            delete g.bidFor[msg.sender];
        }

        emit LogGOPClaim(msg.sender);
    }

    /*
    @dev returns the information from a GOP Auction
    */
    function auctionInformation(uint256 _auction) 
    public 
    view 
    returns(uint256, uint256, uint256, uint256, uint256, address, bool) {
        GOP storage g = gopAuctions[_auction];
        return(g.createdAt, g.minimum, g.gen, g.bidders.length, g.maxBid, g.maxBidder, g.isOpen);
    }

    /*
    @dev Returns the ramining horses for a given gen.
    */
    function horsesRemaining(uint256 _gen) public view returns(uint256) {
        return horsesForGen[_gen];
    }

    /*
    @dev Returns bool indicating if a batch is open and which one is it
    mostly used for displaying in the UI.
    */
    function isABatchOpen() public view returns(bool, uint256) {
        return (anyBatchOpen, currentOpenBatch);
    }
}