pragma solidity 0.4.24;

import "./Auctions.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/*
@description Contract in charge of tracking availability of male horses in Stud.
*/
contract StudService is Auctions {
    using SafeMath for uint256;

    mapping(uint256 => bool) internal isInStud;
    mapping(uint256 => uint256) internal studAmountFor;

    modifier onlyHorseOwner(uint256 _id) {
        require(msg.sender == ownerOf(_id), "Not owner of horse");
        _;
    }

    function putInStud(uint256 _id, uint256 _amount) public onlyHorseOwner(_id) {
        require(bytes32("M") == getHorseSex(_id), "Horse is not a male");
        isInStud[_id] = true;
        studAmountFor[_id] = _amount;
    }

    function removeFromStud(uint256 _id) public onlyHorseOwner(_id) {
        delete isInStud[_id];
        delete studAmountFor[_id];
    }

    function studInfo(uint256 _id) public view returns(bool, uint256) {
        return(isInStud[_id], studAmountFor[_id]);
    }

    /*
    @dev Mostly used for checks in other contracts, i.e. Breeding.
    Ideally we would use 'studInfo/1'
    */
    function isHorseInStud(uint256 _id) external view returns(bool) {
        return isInStud[_id];
    }
}