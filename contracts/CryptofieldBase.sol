pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CryptofieldBase is Ownable {
    using SafeMath for uint256;

    bytes32 private gender; // First horse is a male.
    bytes32[2] private gen = [
        bytes32("M"), 
        bytes32("F")
    ];

    uint256 constant GENOTYPE_CAP = 268;
    uint256 bloodlineCounter;

    address breedingContract;

    // Names used for defaults in G1P.
    string[6] private names = [
        "Austin Riffle",
        "Jerri Curl",
        "Amoxi",
        "Chase Jackson",
        "Zeus",
        "Apollo"
    ];

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

        uint256[7] characteristics;

        string horseHash;
        string name;
        bytes32 bloodline;

        bytes32 sex;
    }

    mapping(uint256 => Horse) public horses;
    mapping(bytes32 => bytes32) internal bloodlines;

    event LogHorseSell(uint256 _horseId, uint256 _amountOfTimesSold);
    event LogHorseBuy(address _buyer, uint256 _timestamp, uint256 _tokenId);
    event LogGOPCreated(address _buyer, uint256 _timestamp, uint256 _tokenId);

    modifier onlyBreeding() {
        require(msg.sender == breedingContract, "Not authorized");
        _;
    }

    constructor() public {
        owner = msg.sender;

        // Bloodline matrix.
        bloodlines[keccak256(abi.encodePacked(bytes32("N"), bytes32("N")))] = "N";
        bloodlines[keccak256(abi.encodePacked(bytes32("N"), bytes32("S")))] = "S";
        bloodlines[keccak256(abi.encodePacked(bytes32("N"), bytes32("F")))] = "F";
        bloodlines[keccak256(abi.encodePacked(bytes32("N"), bytes32("W")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("S"), bytes32("N")))] = "S";
        bloodlines[keccak256(abi.encodePacked(bytes32("S"), bytes32("S")))] = "S";
        bloodlines[keccak256(abi.encodePacked(bytes32("S"), bytes32("F")))] = "F";
        bloodlines[keccak256(abi.encodePacked(bytes32("S"), bytes32("W")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("F"), bytes32("N")))] = "F";
        bloodlines[keccak256(abi.encodePacked(bytes32("F"), bytes32("S")))] = "F";
        bloodlines[keccak256(abi.encodePacked(bytes32("F"), bytes32("F")))] = "F";
        bloodlines[keccak256(abi.encodePacked(bytes32("F"), bytes32("W")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("W"), bytes32("N")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("W"), bytes32("S")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("W"), bytes32("F")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("W"), bytes32("W")))] = "W";
        bloodlines[keccak256(abi.encodePacked(bytes32("W"), bytes32("N")))] = "W";
    }

    // This function should have a random default name for the horse.
    function buyGOP(
        address _buyer, 
        string _horseHash, 
        uint256 _tokenId,
        uint256 _batchNumber
    ) internal {
        require(bloodlineCounter <= 38000, "GOP cap met");

        uint256 genotype;
        bytes32 bloodline;
        uint256 randNum = _getRand(5);
        string memory nameChosen = names[randNum];

        // Pick the gender
        if(gender == gen[0]) {
            gender = gen[1];
        } else {
            gender = gen[0];
        }

        // Generate bloodline and genotype based on '_tokenId'
        // TODO: Add counter for available horses so we can save them for later,
        // Probably will be on another contract and not this one.
        if(_batchNumber == 1) {
            genotype = 1;
            bloodline = bytes32("N");
        } else if(_batchNumber == 2) {
            genotype = 2;
            bloodline = bytes32("N");
        } else if(_batchNumber == 3) {
            genotype = 3;
            bloodline = bytes32("S");
        } else if(_batchNumber == 4) {
            genotype = 4;
            bloodline = bytes32("S");
        } else if(_batchNumber == 5) {
            genotype = 5;
            bloodline = bytes32("F");
        } else if(_batchNumber == 6) {
            genotype = 6;
            bloodline = bytes32("F");
        } else if(_batchNumber == 7) {
            genotype = 7;
            bloodline = bytes32("F");
        } else if(_batchNumber == 8) {
            genotype = 8;
            bloodline = bytes32("W");
        } else if(_batchNumber == 9) {
            genotype = 9;
            bloodline = bytes32("W");
        } else {
            genotype = 10;
            bloodline = bytes32("W");
        }

        Horse memory h;
        h.timestamp = now;
        h.buyer = _buyer;
        h.horseHash = _horseHash;
        h.sex = gender;
        h.baseValue = _getRand();
        h.name = nameChosen;
        h.genotype = genotype;
        h.bloodline = bloodline;

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
            gender = gen[1];
        } else {
            gender = gen[0];
        }

        Horse memory male = horses[_maleParent];
        Horse memory female = horses[_femaleParent];

        Horse memory horse;
        horse.buyer = _buyer;
        // The use of 'now' here shouldn't be a concern since that's only used for the timestamp of a horse
        // which really doesn't have much effect on the horse itself.
        horse.timestamp = now;
        horse.horseHash = _horseHash;
        horse.sex = gender;
        horse.baseValue = _getRand();
        horse.genotype = _getType(male.genotype, female.genotype);
        horse.bloodline = bloodlines[keccak256(abi.encodePacked(male.bloodline, female.bloodline))];

        horses[_tokenId] = horse;

        emit LogHorseBuy(_buyer, now, _tokenId);
    }

    /*
    @dev Only returns the hash containing basic information of horse (color, origin, etc...)
    @param _horseId Token of the ID to retrieve hash from.
    @returns string, IPFS hash
    */
    function getHorseHash(uint256 _horseId) public view returns(string) {
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

    function getTimestamp(uint256 _horseId) public view returns(uint256) {
        return horses[_horseId].timestamp;
    }

    /*
    @dev Gets the name of a given horse
    */
    function getHorseName(uint256 _horseId) public view returns(string) {
        return horses[_horseId].name;
    }

    /*
    @dev Returns the times a horse has been sold.
    */
    function getTimesSold(uint256 _horseId) public view returns(uint256) {
        return horses[_horseId].amountOfTimesSold;
    }

    /*
    @dev Returns the genotype of a given horse.
    */
    function getGenotype(uint256 _horseId) public view returns(uint256) {
        return horses[_horseId].genotype;
    }

    /*
    @dev Returns the bloodline of a horse
    */
    function getBloodline(uint256 _horseId) public view returns(bytes32) {
        return horses[_horseId].bloodline;
    }

    /*
    @dev Adds 1 to the amount of times a horse has been sold.
    @dev Adds unix timestamp of the date the horse was sold.
    */
    function horseSold(uint256 _horseId) internal {
        Horse storage horse = horses[_horseId];
        horse.amountOfTimesSold = horse.amountOfTimesSold.add(1);
        horse.lastTimeSold = now;

        emit LogHorseSell(_horseId, horse.amountOfTimesSold);
    }

    /*
    @dev Sets the name for a given horse, this is for Offsprings only, GOP have default names.
    */
    function setNameFor(string _name, uint256 _horseId) internal {
        Horse storage h = horses[_horseId];
        require(keccak256(abi.encodePacked(h.name)) == keccak256(abi.encodePacked("")), "Name is already defined");
        horses[_horseId].name = _getName(_name, _horseId);
    }

    /* RESTRICTED FUNCTIONS /*

    /*
    @dev Sets the address of the breeding contract.
    */
    function setBreedingAddr(address _address) public onlyOwner() {
        breedingContract = _address;
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
        return uint256(blockhash(block.number.sub(1))) % _max + 1;
    }

    /*
    @dev Gets random number between 1 and 50.
    */
    function _getRand() private view returns(uint256) {
        return uint256(blockhash(block.number.sub(1))) % 50 + 1;
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
    function _getType(uint256 _maleGT, uint256 _femaleGT) private returns(uint256) {
        uint256 geno = _maleGT.add(_femaleGT);
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
