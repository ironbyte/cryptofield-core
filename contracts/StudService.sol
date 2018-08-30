pragma solidity 0.4.24;

import "./Auctions.sol";
import "./usingOraclize.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/*
@description Contract in charge of tracking availability of male horses in Stud.
*/
contract StudService is Auctions, usingOraclize {
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

    modifier onlyHorseOwner(uint256 _id) {
        require(msg.sender == ownerOf(_id), "Not owner of horse");
        _;
    }

    constructor() public {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
    }

    function putInStud(uint256 _id, uint256 _amount, uint256 _duration) public payable onlyHorseOwner(_id) {
        require(msg.value >= oraclize_getPrice("URL"), "Oraclize price not met");
        require(bytes32("M") == getHorseSex(_id), "Horse is not a male");

        uint256 duration = _duration;

        // We'll avoid getting different times in '_duration' by allowing only a few, if none of them are selected
        // we'll use a default one (3 days).
        if(_duration != ALLOWED_TIMEFRAMES[0] || _duration != ALLOWED_TIMEFRAMES[1]) {
            duration = ALLOWED_TIMEFRAMES[0];
        }

        StudInfo storage s;
        s.inStud = true;
        s.matingPrice = _amount;
        s.duration = duration;

        studs[_id] = s;

        string memory url = "json(https://cryptofield.app/api/v1/remove_horse_stud).horse_id";
        string memory payload = strConcat("{\"stud_info\":", uint2str(_id), "}");

        oraclize_query(duration, "URL", url, payload);
    }

    function __callback(bytes32 _id, string result) public {
        require(msg.sender == oraclize_cbAddress(), "Not oraclize");

        uint256 horse = parseInt(result); 
        
        // Manually remove the horse from stud since 'removeFromStud/1' allows only the owner.
        delete studs[horse];
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
    function isHorseInStud(uint256 _id) external view returns(bool) {
        return studs[_id].inStud;
    }

    function getQueryPrice() public view returns(uint256) {
        return oraclize_getPrice("URL");
    }
}