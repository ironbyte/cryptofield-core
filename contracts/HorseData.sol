pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";

/*
@description Contract in charge of sending back needed data for the creation of horses.
*/
contract HorseData is Initializable {
    mapping(bytes32 => bytes32) internal bloodlines;

    function initialize() public initializer {
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

    /*
    @ devGenerate bloodline and genotype based on '_batchNumber'
    */ 
    function getBloodline(uint256 _batchNumber) public pure returns(bytes32) {
        bytes32 bloodline;

        if(_batchNumber == 1) {
            bloodline = bytes32("N");
        } else if(_batchNumber == 2) {
            bloodline = bytes32("N");
        } else if(_batchNumber == 3) {
            bloodline = bytes32("S");
        } else if(_batchNumber == 4) {
            bloodline = bytes32("S");
        } else if(_batchNumber == 5) {
            bloodline = bytes32("F");
        } else if(_batchNumber == 6) {
            bloodline = bytes32("F");
        } else if(_batchNumber == 7) {
            bloodline = bytes32("F");
        } else if(_batchNumber == 8) {
            bloodline = bytes32("W");
        } else if(_batchNumber == 9) {
            bloodline = bytes32("W");
        } else {
            bloodline = bytes32("W");
        }

        return bloodline;
    }

    function getGenotype(uint256 _batchNumber) public pure returns(uint256) {
        require(_batchNumber >= 1 && _batchNumber <= 10, "Batch number out of bounds");
        return _batchNumber;
    }

    function getBaseValue(uint256 _batchNumber) public view returns(uint256) {
        uint256 baseValue;

        if(_batchNumber == 1) {
            baseValue = _getRandom(4, 100);
        } else if(_batchNumber == 2) {
            baseValue = _getRandom(9, 90);
        } else if(_batchNumber == 3) {
            baseValue = _getRandom(4, 80);
        } else if(_batchNumber == 4) {
            baseValue = _getRandom(4, 75);
        } else if(_batchNumber == 5) {
            baseValue = _getRandom(9, 70);
        } else if(_batchNumber == 6) {
            baseValue = _getRandom(4, 60);
        } else if(_batchNumber == 7) {
            baseValue = _getRandom(9, 50);
        } else if(_batchNumber == 8) {
            baseValue = _getRandom(9, 40);
        } else if(_batchNumber == 9) {
            baseValue = _getRandom(9, 30);
        } else {
            baseValue = _getRandom(19, 20);
        }

        return baseValue;
    }

    function getBloodlineFromParents(bytes32 _male, bytes32 _female) public view returns(bytes32) {
        return bloodlines[keccak256(abi.encodePacked(_male, _female))];
    }

    function _getRandom(uint256 _num, uint256 _deleteFrom) private view returns(uint256) {
        uint256 rand = uint256(blockhash(block.number - 1)) % _num + 1;

        return _deleteFrom - rand;
    }
}