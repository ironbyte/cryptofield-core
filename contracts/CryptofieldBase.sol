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

        bytes32 sex;
        bytes32 bloodline;
    }

    mapping(uint256 => Horse) public horses;
    mapping(bytes32 => bytes32) internal bloodlines;

    event LogHorseSell(uint256 _horseId, uint256 _amountOfTimesSold);
    event LogHorseBuy(address _buyer, uint256 _timestamp, uint256 _tokenId);
    event LogGOPCreated(address _buyer, uint256 _timestamp, uint256 _tokenId);

    constructor() public {
        owner = msg.sender;

        // Bloodline matrix.
        bloodlines[keccak256(abi.encodePacked("N", "N"))] = "N";
        bloodlines[keccak256(abi.encodePacked("S", "N"))] = "S";
        bloodlines[keccak256(abi.encodePacked("F", "N"))] = "F";
        bloodlines[keccak256(abi.encodePacked("W", "N"))] = "W";
        bloodlines[keccak256(abi.encodePacked("N", "S"))] = "S";
        bloodlines[keccak256(abi.encodePacked("N", "F"))] = "F";
        bloodlines[keccak256(abi.encodePacked("N", "W"))] = "W";
        bloodlines[keccak256(abi.encodePacked("S", "S"))] = "S";
        bloodlines[keccak256(abi.encodePacked("F", "S"))] = "F";
        bloodlines[keccak256(abi.encodePacked("W", "S"))] = "W";
        bloodlines[keccak256(abi.encodePacked("S", "F"))] = "F";
        bloodlines[keccak256(abi.encodePacked("S", "W"))] = "W";
        bloodlines[keccak256(abi.encodePacked("F", "F"))] = "F";
        bloodlines[keccak256(abi.encodePacked("W", "F"))] = "W";
        bloodlines[keccak256(abi.encodePacked("F", "W"))] = "W";
        bloodlines[keccak256(abi.encodePacked("W", "W"))] = "W";
        bloodlines[keccak256(abi.encodePacked("W", "N"))] = "W";
    }

    // This function should have a random default name for the horse.
    // TODO: Create bloodline for GOP. Offsprings get the bloodline from parents.
    function buyGOP(address _buyer, string _horseHash, uint256 _tokenId, uint256 _genotype) internal {
        uint256 randNum = _getRand(5);
        string memory nameChosen = names[randNum];

        // Pick the gender
        if(gender == gen[0]) {
            gender = gen[1];
        } else {
            gender = gen[0];
        }

        Horse memory h;
        h.timestamp = now;
        h.buyer = _buyer;
        h.horseHash = _horseHash;
        h.sex = gender;
        h.baseValue = _getRand();
        h.name = nameChosen;
        h.genotype = _genotype;

        horses[_tokenId] = h;

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
    @dev Returns the bloodline outcome of two bloodlines
    */
    function getBloodline(string M, string F) public view returns(bytes32) {
        return bloodlines[keccak256(abi.encodePacked(M, F))];
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

    /* RESTRICTED FUNCTIONS /*

    /*
    @dev Changes the baseValue of a horse, this is useful when creating offspring and should be
    allowed only by the breeding contract.
    */
    // TODO: Add Breeding contract modifier
    function setBaseValue(uint256 _horseId, uint256 _baseValue) external {
        Horse storage h = horses[_horseId];
        h.baseValue = _baseValue;
    }

    function setNameFor(string _name, uint256 _horseId) internal {
        Horse storage h = horses[_horseId];
        require(keccak256(abi.encodePacked(h.name)) == keccak256(abi.encodePacked("")), "Name is already defined");
        horses[_horseId].name = _getName(_name, _horseId);
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
