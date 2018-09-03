pragma solidity 0.4.24;

import "./Auctions.sol";
import "./usingOraclize.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/*
@description Contract in charge of tracking availability of male horses in Stud.
*/
contract StudService is Ownable, Auctions, usingOraclize {
    using SafeMath for uint256;

    uint256[2] private ALLOWED_TIMEFRAMES = [
        259200,
        518400
    ];

    struct StudInfo {
        bool inStud;

        uint256 matingPrice;
        uint256 duration;
    }

    mapping(uint256 => StudInfo) internal studs;

    /*
    @dev We only remove the horse from the mapping ONCE the '__callback' is called, this is for a reason.
    For Studs we use Oraclize as a service for queries in the future but we also have a function
    to manually remove the horse from stud once a fee is paid but this does not cancel the 
    query that was already sent, so the horse is blocked from being in Stud again until the
    callback is called and effectively removing it from stud.

    Main case: User puts horse in stud, horse is manually removed, horse is put in stud
    again thus creating another query, this time the user decides to leave the horse
    for the whole period of time but the first query which couldn't be cancelled is 
    executed, calling the '__callback' function and removing the horse from Stud and leaving
    yet another query in air.
    */
    
    mapping(uint256 => bool) internal currentlyInStud;

    modifier onlyHorseOwner(uint256 _id) {
        require(msg.sender == ownerOf(_id), "Not owner of horse");
        _;
    }

    constructor() public {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        owner = msg.sender;
    }

    event LogHorseInStud(uint256 _horseId, uint256 _amount, uint256 _duration);

    function putInStud(uint256 _id, uint256 _amount, uint256 _duration) public payable onlyHorseOwner(_id) {
        require(msg.value >= oraclize_getPrice("URL"), "Oraclize price not met");
        require(bytes32("M") == getHorseSex(_id), "Horse is not a male");
        require(currentlyInStud[_id] == false, "Not removed by oraclize yet");

        uint256 duration = _duration;

        // We'll avoid getting different times in '_duration' by allowing only a few, if none of them are selected
        // we'll use a default one (3 days).
        if(_duration != ALLOWED_TIMEFRAMES[0] || _duration != ALLOWED_TIMEFRAMES[1]) {
            duration = ALLOWED_TIMEFRAMES[0];
        }

        studs[_id] = StudInfo(true, _amount, duration);

        string memory url = "json(https://cryptofield.app/api/v1/remove_horse_stud).horse_id";
        string memory payload = strConcat("{\"stud_info\":", uint2str(_id), "}");

        oraclize_query(duration, "URL", url, payload);

        currentlyInStud[_id] = true;

        emit LogHorseInStud(_id, _amount, duration);
    }

    function __callback(bytes32 _id, string result) public {
        require(msg.sender == oraclize_cbAddress(), "Not oraclize");

        uint256 horse = parseInt(result); 
        
        // Manually remove the horse from stud since 'removeFromStud/1' allows only the owner.
        delete studs[horse];

        currentlyInStud[horse] = false;
    }

    // TODO: Fee for removing a horse from stud before time.
    function removeFromStud(uint256 _id) public onlyHorseOwner(_id) {
        delete studs[_id];
    }

    function studInfo(uint256 _id) public view returns(bool, uint256, uint256) {
        StudInfo storage s = studs[_id];

        return(s.inStud, s.matingPrice, s.duration);
    }

    /*
    @dev Mostly used for checks in other contracts, i.e. Breeding.
    Ideally we would use 'studInfo/1'
    */
    function isHorseInStud(uint256 _id) public view returns(bool) {
        return studs[_id].inStud;
    }

    function matingPrice(uint256 _id) public view returns(uint256) {
        return studs[_id].matingPrice;
    }

    function getQueryPrice() public returns(uint256) {
        return oraclize_getPrice("URL");
    }

    /*   RESTRICTED    */
    function removeHorseOWN(uint256 _id) public onlyOwner() {
        currentlyInStud[_id] = false;
    }
}