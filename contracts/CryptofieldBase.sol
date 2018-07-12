pragma solidity ^0.4.2;

import "./CToken.sol";

contract CryptofieldBase is ERC721BasicToken, CToken {

    uint256 stallionsAvailable = 168;
    uint256 maresAvailable = 379;
    uint256 coltsAvailable = 230;
    uint256 filliesAvailable =  334;

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

    // Counter for Ids
    uint256 counter;

    // Mapping for owned address to horse IDs
    mapping(address => uint256[]) ownedHorses;

    // Mapping from horse ID to index.
    mapping(uint256 => uint256) ownedHorsesIndex;

    // Mapping horse Ids to addresses.
    mapping(uint256 => address) horseOwner;

    modifier onlyAvailable(uint256 _horseId) {
        require(_horseId <= horses.length);
        _;
    }

    event Sell(address _from, address _to, uint256 _horseId, uint256 _amountOfTimesSold);

    function buyStallion(address _buyerAddress, string _horseHash) public payable {
        require(stallionsAvailable > 0);

        /* @dev Just a counter to have an upgoing value of ids starting from 1 up to 1111
        until the 'require' above is not longer met. */
        uint256 newHorseId = counter += 1;

        Horse memory horse;
        horse.buyer = _buyerAddress;
        horse.saleId = newHorseId;
        // The use of 'now' here shouldn't be a concern since that's only used for the timestamp of a horse
        // which really doesn't have much effect on the horse itself.
        horse.timestamp = now;
        horse.horseType = "G1P Thoroughbred"; // G1P lack some values as they're the first ones.
        horse.horseHash = _horseHash;


        // "mint" sends a Transfer event
        mint(msg.sender, newHorseId);

        // If all operations were succesfull.
        horses.push(horse);
        stallionsAvailable -= 1;
    }

    /*
    @dev Transfer ownership of given _horseId, from _from, to _to.
    */
    function sendHorse(address _from, address _to, uint256 _horseId) onlyAvailable(_horseId) public payable {
        _transferTo(_from, _to, _horseId);
    }

    /* @param _from user from where we're retrieving the list of horses owned
    @return uint256[] list of owned horses */
    function getHorsesOwned(address _from) public view returns(uint256[]) {
        return _getHorsesOwned(_from);
    }

    /*
    @returns all G1P available.
    */

    function getHorsesAvailable() public view returns(uint256, uint256, uint256, uint256) {
        return (stallionsAvailable, maresAvailable, coltsAvailable, filliesAvailable);
    }

    /*
    @dev Only returns the hash containing basic information of horse (name, color, origin, etc...)
    @param _horseId Token of the ID to retrieve hash from.
    @returns string, IPFS hash
    */

    function getHorse(uint256 _horseId) onlyAvailable(_horseId) public view returns(string) {
        Horse memory horse = horses[_horseId];

        return (horse.horseHash);
    }

    /*
    @returns uint8[] with horse's foalNames
    */
    function getFoalNames(uint256 _horseId) onlyAvailable(_horseId) public view returns(uint8[]) {
        Horse memory horse = horses[_horseId];
        return horse.foalNames;
    }

    /*
    @returns uint8[] with horse's parents IDs.
    */
    function getParents(uint256 _horseId) onlyAvailable(_horseId) public view returns(uint8[]) {
        Horse memory horse = horses[_horseId];
        return horse.parents;
    }

    /*
    @returns uint8[] with horse's grandparents IDs.
    */
    function getGrandparents(uint256 _horseId) onlyAvailable(_horseId) public view returns(uint8[]) {
        Horse memory horse = horses[_horseId];
        return horse.grandparents;
    }

    /*
    @returns uint8[] with horse's great-grandparents IDs.
    */
    function getGreatGrandparents(uint256 _horseId) onlyAvailable(_horseId) public view returns(uint8[]) {
        Horse memory horse = horses[_horseId];
        return horse.greatgrandparents;
    }

    /*
    @dev We can use the above functions independiently or get the whole family data from this function
    @returns all the information with from a horse's family (Foal names, parents, grandparents and
        great-grandparents)
    */
    function getHorseFamily(uint256 _horseId) onlyAvailable(_horseId) public view
        returns(uint8[], uint8[], uint8[], uint8[]) {

        Horse memory h = horses[_horseId];
        return (h.foalNames, h.parents, h.grandparents, h.greatgrandparents);
    }

    /*
    @returns all the information related to auction of a horse
    */
    function auctionInformation(uint256 _horseId) onlyAvailable(_horseId)
        public view returns(uint256, uint256, uint256, uint256) {

        Horse memory horse = horses[_horseId];

        return (horse.reserveValue, horse.saleValue, horse.feeValue, horse.amountOfTimesSold);
    }

    /*
    @returns The owner of the given _horseId
    */
    function ownerOfHorse(uint256 _horseId) onlyAvailable(_horseId) public view returns(address) {
        return _ownerOf(_horseId);
    }

    /*
    @dev Adds 1 to the amount of times a horse has been sold.
    @dev Adds unix timestamp of the date the horse was sold.
    */
    function horseSell(address _from, address _to, uint256 _horseId) onlyAvailable(_horseId) public payable {
        _transferTo(_from, _to, _horseId);

        Horse storage horse = horses[_horseId];
        horse.amountOfTimesSold += 1;
        horse.dateSold = now;
    }
}
