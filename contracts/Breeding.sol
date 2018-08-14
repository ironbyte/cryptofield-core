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
        // TODO: Add tracking number for new horse
        HorseBreed memory horse;
        horse.trackingNumber = now;

        horseBreedById[_horseId] = horse;
    }

    /*
    @dev Creates a new token based on parents.
    */
    function mix(uint256 _maleParent, uint256 _femaleParent) external {
        HorseBreed storage male = horseBreedById[_maleParent];
        HorseBreed storage female = horseBreedById[_femaleParent];

        require(_maleParent != 0 || _femaleParent != 0, "Can't mix with genesis horse"); // You can't mix with the first horse.;
        require(_checkGenders(_maleParent, _femaleParent), "Genders are the same");
        // require(_checkOffspringCounter(male, female), "Max cap reached");

        if(female.firstOffspring == 0) {
            female.firstOffspring = now;
        }

        if(male.firstOffspring == 0) {
            male.firstOffspring = now;
        }

        // We'll get the lineage numbers from these parents.
        uint256[3] memory maleParentLineage = _getMaleParentLineage(_maleParent);
        uint256[3] memory femaleParentLineage = _getFemaleParentLineage(_femaleParent);

        // Prevents that lineages collide.
        require(_canBreed(maleParentLineage, femaleParentLineage), "Lineages collide");

        // The offspring belongs to the owner of the female horse.
        uint256 tokenId = allTokensLength();
        address offspringOwner = ownerOf(_femaleParent);
        _mint(offspringOwner, tokenId);
        // buyHorse(offspringOwner)

        male.offspringCounter = male.offspringCounter.add(1);
        female.offspringCounter = female.offspringCounter.add(1);

        emit OffspringCreated(_maleParent, _femaleParent, tokenId);
    }

    /*
    @dev Returns the lineage numbers of the male parent.
    */
    function _getMaleParentLineage(uint256 _id) private view returns(uint256[3]) {
        HorseBreed memory parent = horseBreedById[_id];

        // We do this manually since we know they're just numbers we're getting.
        uint256[3] memory lineageParents = [
            parent.trackingNumber,
            parent.lineageOne,
            parent.lineageTwo
        ];

        return lineageParents;
    }

    function _getFemaleParentLineage(uint256 _id) private view returns(uint256[3]) {
        HorseBreed memory parent = horseBreedById[_id];

        // We do this manually since we know they're just numbers we're getting.
        uint256[3] memory lineageParents = [
            parent.trackingNumber,
            parent.lineageOne,
            parent.lineageTwo
        ];

        return lineageParents;
    }

    /*
    Based on the lineages sent check if there is no coallison between them, i.e. one being equal to another.
    */
    function _canBreed(uint256[3] _male, uint256[3] _female) private pure returns(bool) {
        for(uint i = 0; i < 2; i++) {
            // We're going to ignore the 0 as it is a default value or Genesis horse.
            if(_male[i] == 0 || _female[i] == 0) {
                return true;
            } else {
                // If the current element from '_male' is the same as one of those on '_female'
                // return 'false' so the 'require' isn't met.
                if(_male[i] == _female[0] || _male[i] == _female[1] || _male[i] == _female[2]) {return false;}
            }

        }

        return true;
    }

    /*
    @dev Checks whether the male or female parent have less than the max cap for offsprings for the year.
    We're going to check the amount of years that have gone by and multiply that by the max cap,
    and check if the horse has not met its maximum cap yet.
    */
    function _checkOffspringCounter(HorseBreed male, HorseBreed female) private returns(bool) {
        uint256 maleYearsGoneBy = now.sub(male.firstOffspring).div(365 days);
        uint256 maleCapAllowed = maleYearsGoneBy.mul(MALE_CAP);

        uint256 femaleYearsGoneBy = now.sub(female.firstOffspring).div(365 days);
        uint256 femaleCapAllowed = femaleYearsGoneBy.mul(FEMALE_CAP);

        require(male.offspringCounter <= maleCapAllowed, "Male cap reached");
        require(female.offspringCounter <= femaleCapAllowed, "Female cap reached");
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
    @dev Returns a given horse tracking number
    */
    function getTrackingNumber(uint256 _id) public view returns(uint256) {
        return horseBreedById[_id].trackingNumber;
    }

    /*
    @dev Returns a horse stats for breeding.
    */
    function getHorseOffspringStats(uint256 _horseId) public returns(uint256, uint256) {
        HorseBreed memory h = horseBreedById[_horseId];
        return(h.offspringCounter, h.firstOffspring);
    }
}