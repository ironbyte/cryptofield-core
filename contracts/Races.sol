pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/*
@description This contract is in charge of keeping some kind of state and
handling anything related to payments, everything else is being handled by the API.
*/
contract Races {
    using SafeMath for uint256;

    struct HorseProfile {
        uint256 wins;
        uint256 starts;
        uint256 etherWon;
        uint256 points;
        uint256 lottery;
        uint256 paid;
    }

    mapping(uint256 => HorseProfile) internal horseProfile;

    // TODO: RESTRICT THIS FUNCTION TO THE OWNER MAYBE.
    function putDataForHorses(
        uint256 _winner, 
        uint256 _winnerPoints,
        uint256[] _ids, 
        uint256[] _points,
        uint256[] _lottery,
        uint256[] _paid
    ) 
    public {
            
        HorseProfile storage winner = horseProfile[_winner];
        winner.wins += 1;
        winner.starts += 1;
        winner.points = winner.points.add(_winnerPoints);

        for (uint256 i = 0; i < _ids.length; i++) {
            HorseProfile storage h = horseProfile[_ids[i]];
            
            h.starts += 1;
            h.points = h.points.add(_points[i]);
        }

        for (uint256 j = 0; j < _lottery.length; j++) {
            horseProfile[_lottery[j]].lottery += 1;
        }

        for (uint256 k = 0; k < _paid.length; k++) {
            horseProfile[_paid[k]].paid += 1;
        }
    }

    function getRaceProfile(
        uint256 _horse
    ) 
    public 
    view 
    returns(uint256, uint256, uint256, uint256, uint256, uint256) {

        HorseProfile memory h = horseProfile[_horse];

        return (h.wins, h.starts, h.etherWon, h.points, h.lottery, h.paid); 
    }
}