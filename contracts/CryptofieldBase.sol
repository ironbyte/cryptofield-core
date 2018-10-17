pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./HorseData.sol";

contract CryptofieldBase is Ownable {
    bytes32 horseType;
    bytes32 private gender; // First horse is a male.
    bytes32[2] private gen = [
        bytes32("M"), 
        bytes32("F")
    ];

    uint256 constant GENOTYPE_CAP = 268;
    uint256 bloodlineCounter;

    address breedingContract;
    HorseData public horseDataContract;

    /*
    @dev horseHash stores basic horse information in a hash returned by IPFS.
    */
    struct Horse {
        address buyer;

        uint256 genotype;
        uint256 baseValue;
        uint256 timestamp;
        uint256 lastTimeSold;
        uint256 amountOfTimesSold;

        string horseHash;

        bytes32 bloodline;
        bytes32 sex;
        bytes32 hType;
    }

    mapping(uint256 => Horse) public horses;

    event LogHorseSell(uint256 _horseId, uint256 _amountOfTimesSold);
    event LogHorseBuy(address _buyer, uint256 _timestamp, uint256 _tokenId);
    event LogGOPCreated(address _buyer, uint256 _timestamp, uint256 _tokenId);

    modifier onlyBreeding() {
        require(msg.sender == breedingContract, "Not authorized");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function buyGOP(
        address _buyer, 
        string _horseHash, 
        uint256 _tokenId,
        uint256 _batchNumber,
        uint256 _baseValue
    ) internal {
        require(bloodlineCounter <= 38000, "GOP cap met");

        // Pick the gender and type.
        if(gender == gen[0]) {
            gender = gen[1]; // Female
            horseType = bytes32("Filly");
        } else {
            gender = gen[0]; // Male
            horseType = bytes32("Colt");
        }

        bytes32 bloodline = horseDataContract.getBloodline(_batchNumber);
        uint256 genotype = horseDataContract.getGenotype(_batchNumber);

        Horse memory h;
        h.timestamp = now;
        h.buyer = _buyer;
        h.horseHash = _horseHash;
        h.sex = gender;
        h.baseValue = _baseValue;
        h.genotype = genotype;
        h.bloodline = bloodline;
        h.hType = horseType;

        horses[_tokenId] = h;

        bloodlineCounter += 1;

        emit LogGOPCreated(_buyer, now, _tokenId);
    }

    /*
    @dev Called internally, should only be called by 'Token'.
    */
    function buyOffspring(
        address _buyer, 
        string _horseHash, 
        uint256 _tokenId,
        uint256 _maleParent,
        uint256 _femaleParent
        ) internal {

        if(gender == gen[0]) {
            gender = gen[1]; // Female
            horseType = bytes32("Filly");
        } else {
            gender = gen[0]; // Male
            horseType = bytes32("Colt");
        }

        Horse storage male = horses[_maleParent];
        Horse storage female = horses[_femaleParent];

        // Change type of parents
        male.hType = bytes32("Stallion");
        female.hType = bytes32("Mare");

        Horse memory horse;
        horse.buyer = _buyer;
        // The use of 'now' here shouldn't be a concern since that's only used for the timestamp of a horse
        // which really doesn't have much effect on the horse itself.
        horse.timestamp = now;
        horse.horseHash = _horseHash;
        horse.sex = gender;
        horse.genotype = _getType(male.genotype, female.genotype);
        horse.bloodline = horseDataContract.getBloodlineFromParents(male.bloodline, female.bloodline);
        horse.hType = horseType;

        horses[_tokenId] = horse;

        emit LogHorseBuy(_buyer, now, _tokenId);
    }

    /*
    @dev Returns data from a horse.
    */
    function getHorseData(
        uint256 _horse
    )
    public
    view
    returns(string, bytes32, uint256, uint256, uint256, uint256, bytes32, bytes32) {
        Horse storage h = horses[_horse];

        return (
            h.horseHash,
            h.sex,
            h.baseValue,
            h.timestamp,
            // h.name,
            h.amountOfTimesSold,
            h.genotype,
            h.bloodline,
            h.hType
        );
    }

    function getHorseSex(uint256 _horse) public view returns(bytes32) {
        return horses[_horse].sex;
    }

    function getTimestamp(uint256 _horse) public view returns(uint256) {
        return horses[_horse].timestamp;
    }

    function getBaseValue(uint256 _horse) public view returns(uint256) {
        return horses[_horse].baseValue;
    }

    /*
    @dev Adds 1 to the amount of times a horse has been sold.
    @dev Adds unix timestamp of the date the horse was sold.
    */
    function horseSold(uint256 _horseId) internal {
        Horse storage horse = horses[_horseId];
        horse.amountOfTimesSold += 1;
        horse.lastTimeSold = now;

        emit LogHorseSell(_horseId, horse.amountOfTimesSold);
    }

    // /*
    // @dev Sets the name for a given horse, this is for Offsprings only, GOP have default names.
    // */
    // function setNameFor(string _name, uint256 _horseId) internal {
    //     Horse storage h = horses[_horseId];
    //     require(keccak256(abi.encodePacked(h.name)) == keccak256(abi.encodePacked("")), "Name is already defined");
    //     horses[_horseId].name = _getName(_name, _horseId);
    // }

    /* RESTRICTED FUNCTIONS /*

    /*
    @dev Sets the address of the breeding contract.
    */
    function setBreedingAddr(address _address) public onlyOwner() {
        breedingContract = _address;
    }

    /*
    @dev Sets address for HorseData contract
    */
    function setHorseDataAddr(address _address) public onlyOwner() {
        horseDataContract = HorseData(_address);
    }

    /*
    @dev Changes the baseValue of a horse, this is useful when creating offspring and should be
    allowed only by the breeding contract.
    */
    function setBaseValue(uint256 _horseId, uint256 _baseValue) external onlyBreeding() {
        Horse storage h = horses[_horseId];
        h.baseValue = _baseValue;
    }

    /* PRIVATE FUNCTIONS */

    /*
    @dev Gets a random number between 1 and 'max';
    */
    function _getRand(uint256 _max) private view returns(uint256) {
        return uint256(blockhash(block.number - 1)) % _max + 1;
    }

    /*
    @dev Gets random number between 1 and 50.
    */
    function _getRand() private view returns(uint256) {
        return uint256(blockhash(block.number - 1)) % 50 + 1;
    }

    /*
    @dev Generates a random name depending on the input
    */
    function _getName(string _name, uint256 _Id) private pure returns(string) {
        if(keccak256(abi.encodePacked(_name)) == keccak256(abi.encodePacked(""))) {
            // Generate a random name.
            return strConcat("X", uint2str(_Id));
        }

        return _name;
    }

    /*
    @dev Calculates the genotype for an offspring based on the type of the parents.
    @dev It returns the Genotype for an offspring unless it is greater than the cap, otherwise it returns the CAP.
    */
    function _getType(uint256 _maleGT, uint256 _femaleGT) private pure returns(uint256) {
        // We're not going to run into overflows here since we have a genotype cap.
        uint256 geno = _maleGT + _femaleGT;
        if(geno > GENOTYPE_CAP) return GENOTYPE_CAP;
        return geno;
    }


    /* ORACLIZE IMPLEMENTATION */

    /* @dev Converts 'uint' to 'string' */
    function uint2str(uint256 i) internal pure returns(string) {
        if (i == 0) return "0";
        uint256 j = i;
        uint256 len;
        while (j != 0){
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }

    /* @dev Concatenates two strings together */
    function strConcat(string _a, string _b, string _c, string _d, string _e) internal pure returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(string _a, string _b, string _c, string _d) internal pure returns (string) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(string _a, string _b, string _c) internal pure returns (string) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(string _a, string _b) internal pure returns (string) {
        return strConcat(_a, _b, "", "", "");
    }
}
