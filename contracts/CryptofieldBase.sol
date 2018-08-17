pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CryptofieldBase {
    using SafeMath for uint256;

    uint256 private saleId;

    bytes32 private lastSex = "F"; // First horse is a male.

    /*
    @dev horseHash stores basic horse information in a hash returned by IPFS.
    */
    struct Horse {
        address buyer;

        uint256 baseValue;

        uint256 saleId;
        uint256 timestamp;
        uint256 reserveValue;
        uint256 saleValue;
        uint256 feeValue;
        uint256 dateSold;
        uint256 amountOfTimesSold;

        uint256[7] characteristics;

        string previousOwner;
        string horseHash;

        bytes32 sex;

    }

    mapping(uint256 => Horse) public horses;

    event HorseSell(uint256 _horseId, uint256 _amountOfTimesSold);
    event HorseBuy(address _buyer, uint256 _timestamp, uint256 _saleId);

    function buyHorse(address _buyer, string _horseHash, uint256 _tokenId) public {
        saleId = saleId.add(1);

        bytes32[2] memory gen = [bytes32("M"), bytes32("F")];

        Horse memory horse;
        horse.buyer = _buyer;
        horse.saleId = saleId;
        // The use of 'now' here shouldn't be a concern since that's only used for the timestamp of a horse
        // which really doesn't have much effect on the horse itself.
        horse.timestamp = now;
        horse.horseHash = _horseHash;
        horse.sex = (lastSex == gen[0] ? gen[1] : gen[0]);
        horse.baseValue = _getRand();

        if(lastSex == gen[0]) {lastSex = gen[1];} else {lastSex = gen[0];}

        horses[_tokenId] = horse;

        emit HorseBuy(_buyer, now, horse.saleId);
    }

    /*
    @dev Only returns the hash containing basic information of horse (name, color, origin, etc...)
    @param _horseId Token of the ID to retrieve hash from.
    @returns string, IPFS hash
    */

    function getHorse(uint256 _horseId) public view returns(string) {
        return horses[_horseId].horseHash;
    }

    /*
    @dev Returns sex of horse.
    */
    function getHorseSex(uint256 _horseId) public view returns(bytes32) {
        return horses[_horseId].sex;
    }

    /*
    @dev Gets the base value of a given horse.
    */
    function getBaseValue(uint256 _horseId) public view returns(uint) {
        return horses[_horseId].baseValue;
    }

    /*
    @dev Adds 1 to the amount of times a horse has been sold.
    @dev Adds unix timestamp of the date the horse was sold.
    */

    //TODO: Add modifier in this function
    function horseSold(uint256 _horseId) public {
        Horse storage horse = horses[_horseId];
        horse.amountOfTimesSold = horse.amountOfTimesSold.add(1);
        horse.dateSold = now;

        emit HorseSell(_horseId, horse.amountOfTimesSold);
    }

    function getTimestamp(uint256 _horseId) public view returns(uint256) {
        return horses[_horseId].timestamp;
    }

    /* RESTRICTED FUNCTIONS /*

    /*
    @dev Changes the baseValue of a horse, this is useful when creating offspring and should be
    allowed only by the breeding contract.
    */

    // TODO: Add Breeding contract modifier
    function setBaseValue(uint256 _horseId, uint256 _baseValue) public {
        Horse storage h = horses[_horseId];
        h.baseValue = _baseValue;
    }

    /* PRIVATE FUNCTIONS */

    /*
    @dev Gets random number between 1 and 'max'.
    */
    function _getRand() private view returns(uint256) {
        return uint256(blockhash(block.number.sub(1))) % 50 + 1;
    }
}
