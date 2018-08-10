pragma solidity 0.4.24;

/*
@dev Breeding contract in charge of generating new horses and stats for breeding.
*/
contract Breeding {

    // All this is subject to a change
    struct HorseBreed {
        uint256[2] parentsId;

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
        uint256 reaceOutcome;
        uint256 tieBreaker;
        uint256 oddValue;
        uint256 oddComparison;
        uint256 racesWon;
        uint256 racesLost;
    }

    // Maps the horseID to a specific HorseBreed struct.
    mapping(uint256 => HorseBreed) internal horseBreedById;

    /*
    @dev Creates a struct for a given horseId.
    @dev There are two ways to initialize horses, with this function or calling 'mix' which takes the parent's id
    and some other values to create another horse.
    */
    function initHorse(uint256 _horseId, uint256 _trackingNumber) external {
        // TODO: Add tracking number for new horse
        HorseBreed memory horse;
        horse.trackingNumber = _trackingNumber;

        horseBreedById[_horseId] = horse;
    }

    /*
    @dev Creates a new token based on parents.
    */
    function mix(uint256 _maleParent, uint256 _femaleParent) external {
        require(_maleParent != 0 || _femaleParent != 0, "Can't mix with genesis horse"); // You can't mix with the first horse.

        // We'll get the lineage numbers from these parents.
        uint256[3] memory maleParentLineage = _getMaleParentLineage(_maleParent);
        uint256[3] memory femaleParentLineage = _getFemaleParentLineage(_femaleParent);

        // Prevents lineage collide.
        require(_canBreed(maleParentLineage, femaleParentLineage), "Lineages collide");

        // TODO: Token minting here
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
            // If the current element from '_male' is the same as one of those on '_female'
            // return 'false' so the 'require' isn't met.
            if(_male[i] == _female[0] || _male[i] == _female[1] || _male[i] == _female[2]) {return false;}
        }

        return true;
    }

    /*
    @dev Returns a given horse tracking number
    */
    function getTrackingNumber(uint256 _id) public view returns(uint256) {
        return horseBreedById[_id].trackingNumber;
    }
}