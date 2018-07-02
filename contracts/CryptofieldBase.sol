pragma solidity ^0.4.2;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import "./CToken.sol";

contract CryptofieldBase is ERC721BasicToken, CToken {
    using SafeMath for uint256;

    uint256 stallionsAvailable = 157;
    uint256 maresAvailable = 368;
    uint256 coltsAvailable = 219;
    uint256 filliesAvailable =  323;
    uint256 glendingsAvailable = 44;

    /*
    TODO:
    1. Add Phenotypes and Genotypes fields
    @dev 'timestamp' is used to calculate the age of the horse.
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
    function sendHorse(address _from, address _to, uint256 _horseId) public payable {
        _transferTo(_from, _to, _horseId);
    }

    /* @param _from user from where we're retrieving the list of horses owned
    @return uint256[] list of owned horses */
    function getHorsesOwned(address _from) public view returns(uint256[]) {
        return _getHorsesOwned(_from);
    }

    /*
    @returns G1P available.
    */

    function getHorsesAvailable() public view returns(uint256, uint256, uint256, uint256, uint256) {
        return (stallionsAvailable, maresAvailable, coltsAvailable, filliesAvailable, glendingsAvailable);
    }

    /*
    @dev Only returns the hash containing basic information of horse (name, color, origin, etc...)
    @param _horseId Token of the ID to retrieve hash from.
    @returns string, ipfs hash
    */

    function getHorse(uint256 _horseId) onlyAvailable(_horseId) public view returns(string) {
        Horse memory horse = horses[_horseId];

        return (horse.horseHash);
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
    function ownerOfHorse(uint256 _horseId) public view returns(address) {
        return _ownerOf(_horseId);
    }

    /*
    @dev Adds 1 to the old amount of times sold of a given horse.
    @returns boolean indicating success
    */
    function horseSell(address _from, address _to, uint256 _horseId) onlyAvailable(_horseId) public {
        Horse memory horse = horses[_horseId];
        sendHorse(_from, _to, _horseId);
        horse.amountOfTimesSold += 1;

        emit Sell(_from, _to, _horseId, horse.amountOfTimesSold);
    }
}
