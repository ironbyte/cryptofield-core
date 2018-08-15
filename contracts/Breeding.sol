pragma solidity 0.4.24;

import "./Auctions.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// TODO: PROBABLY MOVING MOST OF THIS LOGIC TO ANOTHER CONTRACT

/*
@dev Breeding contract in charge of generating new horses and stats for breeding.
*/
contract Breeding is Auctions {
    using SafeMath for uint256;

    uint256 constant MALE_CAP = 240;
    uint256 constant FEMALE_CAP =  48;

    // All this is subject to a change
    struct HorseBreed {
        uint256[2] parentsId;

        uint256 firstOffspring;
        uint256 trackingNumber;
        uint256 lineageOne;
        uint256 lineageTwo;
        uint256 lineageThree;
        uint256 lineageFour;
        uint256 lineageFive;
        uint256 lineageSix;
        uint256 raceCounter;
        uint256 offspringCounter;
        uint256 raceVariable;
        uint256 racePerfomance;
        uint256 raceOutcome;
        uint256 tieBreaker;
        uint256 oddValue;
        uint256 oddComparison;
        uint256 racesWon;
        uint256 racesLost;
    }

    // Maps the horseID to a specific HorseBreed struct.
    mapping(uint256 => HorseBreed) internal horseBreedById;

    event OffspringCreated(uint256 _father, uint256 _mother, uint256 _offspring);

    /*
    @dev Creates a struct for a given horseId.
    @dev There are two ways to initialize horses, with this function or calling 'mix' which takes the parent's id
    and some other values to create another horse.
    */
    function initHorse(uint256 _horseId) external {
        HorseBreed memory horse;
        horse.trackingNumber = now;

        horseBreedById[_horseId] = horse;
    }

    /*
    @dev Creates a new token based on parents.
    */
    function mix(uint256 _maleParent, uint256 _femaleParent, string _hash) external {
        HorseBreed storage male = horseBreedById[_maleParent];
        HorseBreed storage female = horseBreedById[_femaleParent];

        // The offspring belongs to the owner of the female horse.
        address offspringOwner = ownerOf(_femaleParent);

        require(msg.sender == offspringOwner, "Not owner of female horse");
        require(_maleParent != 0 || _femaleParent != 0, "Can't mix with genesis horse"); // You can't mix with the first horse.
        require(_checkGenders(_maleParent, _femaleParent), "Genders are the same");

        // Since this means that it is the first offspring of either one, we get their timestamp here and use
        // it as their tracking number.
        if(female.firstOffspring == 0) {
            female.trackingNumber = _genTrackingNumber(_femaleParent);
            female.firstOffspring = now;
        }

        if(male.firstOffspring == 0) {
            male.trackingNumber = _genTrackingNumber(_maleParent);
            male.firstOffspring = now;
        }

        // We'll get the lineage numbers from these parents.
        uint256[3] memory maleParentLineage = _getMaleParentLineage(male);
        uint256[3] memory femaleParentLineage = _getFemaleParentLineage(female);

        // Prevents that lineages collide.
        require(_canBreed(maleParentLineage, femaleParentLineage), "Lineages collide");

        uint256 tokenId = createHorse(offspringOwner, _hash);

        male.offspringCounter = male.offspringCounter.add(1);
        female.offspringCounter = female.offspringCounter.add(1);

        require(_notRelated(_maleParent, _femaleParent, male, female), "Horses are directly related");

        // Default is 0, the firstOffspring key needs to yield something else than 0 otherwise this
        // 'require' will never be met.
        require(_checkOffspringCounter(male, female), "Max cap reached");

        // offspring data
        HorseBreed storage o = horseBreedById[tokenId];
        o.trackingNumber = _genFirstTrackingNumber();
        o.parentsId = [_maleParent, _femaleParent];
        o.lineageOne = male.trackingNumber;
        o.lineageTwo = female.trackingNumber;
        o.lineageThree = male.lineageOne;
        o.lineageFour = male.lineageTwo;
        o.lineageFive = female.lineageOne;
        o.lineageSix = female.lineageTwo;

        emit OffspringCreated(_maleParent, _femaleParent, tokenId);
    }

    /*
    @dev Returns the lineage numbers of the male parent.
    */
    function _getMaleParentLineage(HorseBreed _parent) private view returns(uint256[3]) {
        // We do this manually since we know they're just numbers we're getting.
        uint256[3] memory lineageParents = [
            _parent.trackingNumber,
            _parent.lineageOne,
            _parent.lineageTwo
        ];

        return lineageParents;
    }
 
    /*
    @dev Returns the lineage numbers of the female parent.
    */
    function _getFemaleParentLineage(HorseBreed _parent) private view returns(uint256[3]) {
        // We do this manually since we know they're just numbers we're getting.
        uint256[3] memory lineageParents = [
            _parent.trackingNumber,
            _parent.lineageOne,
            _parent.lineageTwo
        ];

        return lineageParents;
    }

    /*
    Based on the lineages sent check if there is no coallison between them, i.e. one being equal to another.
    */
    function _canBreed(uint256[3] _male, uint256[3] _female) private pure returns(bool) {
        // Checks that tracking numbers aren't the same from lineageOne to lineageSix on male and female.
        for(uint i = 0; i < 2; i++) {
            // We're going to ignore the 0 as it is a default value or Genesis horse.
            if(_male[i] == 0 || _female[i] == 0) {
                continue;
            } else {
                // If the current element from '_male' is the same as one of those on '_female'
                // return 'false' so the 'require' isn't met.
                if(_male[i] == _female[0] || _male[i] == _female[1] || _male[i] == _female[2]) {return false;}
            }
        }

        return true;
    }

    /*
    @dev Checks that none of the horses are related, i.e. One is not an offspring of another
    */
    function _notRelated(
        uint256 _maleId,
        uint256 _femaleId,
        HorseBreed m,
        HorseBreed f
    ) private returns(bool) 
    {
        if(m.parentsId[0] == _maleId || m.parentsId[0] == _femaleId || f.parentsId[0] == _maleId || f.parentsId[1] == _femaleId) {
            return false;
        }

        return true;
    }

    /*
    @dev Checks whether the male or female parent have less than the max cap for offsprings for the year.
    We're going to check the amount of years that have gone by and multiply that by the max cap,
    and check if the horse has not met its maximum cap yet.
    */
    function _checkOffspringCounter(HorseBreed male, HorseBreed female) private returns(bool) {
        uint256 maleYearsGoneBy = now.sub(male.firstOffspring).div(365 days).add(1);
        uint256 maleCapAllowed = maleYearsGoneBy.mul(MALE_CAP);

        uint256 femaleYearsGoneBy = now.sub(female.firstOffspring).div(365 days).add(1);
        uint256 femaleCapAllowed = femaleYearsGoneBy.mul(FEMALE_CAP);

        return male.offspringCounter <= maleCapAllowed || female.offspringCounter <= femaleCapAllowed;
    }

    /*
    @dev Check if the horses have the correct sex for breeding.
    */
    function _checkGenders(uint256 _first, uint256 _second) private returns(bool) {
        // TODO: After checking if bodies from this contract will be moved out of Core
        // Add calling to Core/Base
        string memory firstHorseSex = getHorseSex(_first);
        string memory secondHorseSex = getHorseSex(_second);

        return keccak256(abi.encodePacked(firstHorseSex)) != keccak256(abi.encodePacked(secondHorseSex));
    }

    /*
    @dev Gets a random tracking number by dividing the current timestamp by a random number.
    */
    function _genFirstTrackingNumber() private returns(uint256) {
        return now.div(_getRanNum());
    }

    /*
    @dev Gets a random tracking number by using the timestamp of an already generated horse. 
    */
    function _genTrackingNumber(uint256 _horseId) private returns(uint256) {
        uint256 ts = getTimestamp(_horseId);
        uint256 rand = _getRanNum();
        return ts.div(rand);
    }

    /*
    @dev Gets a random number between 1 and 100, there are not security concerns here so we're using the
    block.blockhash and block.number.
    */
    function _getRanNum() private view returns(uint256) {
        return uint256(blockhash(block.number.sub(1))) % 100 + 1;
    }

    /*
    @dev Returns a given horse tracking number
    */
    function getTrackingNumber(uint256 _id) public view returns(uint256) {
        return horseBreedById[_id].trackingNumber;
    }

    /*
    @dev Returns a horse stats for breeding.
    */
    function getHorseOffspringStats(uint256 _horseId) public view returns(uint256, uint256) {
        HorseBreed memory h = horseBreedById[_horseId];
        return(h.offspringCounter, h.firstOffspring);
    }

    /*
    @dev Get lineages of a horse
    */
    function getLineage(uint256 _horseId) public view returns(uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        HorseBreed memory h = horseBreedById[_horseId];
        return(h.trackingNumber, h.lineageOne, h.lineageTwo, h.lineageThree, h.lineageFour, h.lineageFive, h.lineageSix);
    }
}