pragma solidity ^0.4.2;

contract CryptofieldBase {
    uint256 saleId;

    /*
    @dev horseHash stores basic horse information in a hash returned by IPFS.
    */
    struct Horse {
        address buyer;

        uint256 saleId;
        uint256 timestamp;
        uint256 reserveValue;
        uint256 saleValue;
        uint256 feeValue;
        uint256 dateSold;
        uint256 amountOfTimesSold;

        // Check if we can use bytes32[] instead of uint8[] to store foal names.
        uint8[] foalNames;
        uint8[] parents;
        uint8[] grandparents;
        uint8[] greatgrandparents;

        string previousOwner;
        string horseType;
        string horseHash;

        // Rank is based on awards.
        bytes32 rank;

    }

    Horse[] horses;

    event HorseSell(uint256 _horseId, uint256 _amountOfTimesSold);
    event Buy(address _buyer, uint256 _timestamp, uint256 _saleId);

    function buyHorse(address _buyer, string _horseHash) external returns(bool) {
        saleId += 1;

        Horse memory horse;
        horse.buyer = _buyer;
        horse.saleId = saleId;
        // The use of 'now' here shouldn't be a concern since that's only used for the timestamp of a horse
        // which really doesn't have much effect on the horse itself.
        horse.timestamp = now;
        horse.horseType = "G1P Thoroughbred"; // G1P lack some values as they're the first ones.
        horse.horseHash = _horseHash;

        horses.push(horse);

        emit Buy(_buyer, now, horse.saleId);

        return true;
    }

    /*
    @dev Only returns the hash containing basic information of horse (name, color, origin, etc...)
    @param _horseId Token of the ID to retrieve hash from.
    @returns string, IPFS hash
    */

    function getHorse(uint256 _horseId) public view returns(string) {
        Horse memory horse = horses[_horseId];

        return (horse.horseHash);
    }

    /*
    @dev Gets the length of the horses array
    */
    function getHorsesLength() public view returns(uint256) {
        return horses.length;
    }

    /*
    @dev We can use the above functions independiently or get the whole family data from this function
    @returns all the information with from a horse's family (Foal names, parents, grandparents and
        great-grandparents)
    */
    function getHorseFamily(uint256 _horseId) public view returns(uint8[], uint8[], uint8[], uint8[]) {
        Horse memory h = horses[_horseId];
        return (h.foalNames, h.parents, h.grandparents, h.greatgrandparents);
    }

    /*
    @returns all the information related to auction of a horse
    */
    function horseAuctionInformation(uint256 _horseId)
        public view returns(uint256, uint256, uint256, uint256) {

        Horse memory horse = horses[_horseId];

        return (horse.reserveValue, horse.saleValue, horse.feeValue, horse.amountOfTimesSold);
    }

    /*
    @dev Adds 1 to the amount of times a horse has been sold.
    @dev Adds unix timestamp of the date the horse was sold.
    */
    function horseSold(uint256 _horseId) external {
        Horse storage horse = horses[_horseId];
        horse.amountOfTimesSold += 1;
        horse.dateSold = now;

        emit HorseSell(_horseId, horse.amountOfTimesSold);
    }
}
