pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Core.sol";

/*
@dev Contract in charge of creating auctions for G1P horses
from 1 to 10, i.e. ZED 1 / ZED 10, having a lower genotype makes a horse rarer.
*/
contract GOPCreator is Ownable {
    using SafeMath for uint256;

    bool anyBatchOpen;

    uint256 currentOpenBatch;

    Core core;

    mapping(uint256 => bool) internal isBatchOpen;
    mapping(uint256 => uint256) internal horsesForGen;

    constructor(address _addr) public {
        owner = msg.sender;
        core = Core(_addr);

        horsesForGen[1] = 100;
        horsesForGen[2] = 200;
        horsesForGen[3] = 300;
        horsesForGen[4] = 400;
        horsesForGen[5] = 1000;
        horsesForGen[6] = 2000;
        horsesForGen[7] = 4000;
        horsesForGen[8] = 8000;
        horsesForGen[9] = 10000;
        horsesForGen[10] = 12000;
    }

    // TODO: Auctioned horses and horses that can be bought instantly. 
    function openBatch(uint256 _batch) public onlyOwner() {
        require(!anyBatchOpen, "A batch is already open");
        require(_batch >= 1 && _batch <= 10, "Gen not recognized");

        anyBatchOpen = true;
        currentOpenBatch = _batch;
    }

    function closeBatch(uint256 _batch) public onlyOwner() {
        delete isBatchOpen[_batch];
        delete anyBatchOpen;
        delete currentOpenBatch;
    }

    function createGOP(address _owner, string _hash) public returns(uint256) {
        require(anyBatchOpen, "No batch open");
        require(horsesForGen[currentOpenBatch] != 0, "Cap for Gen specified already met");

        uint256 horseId = core.createGOP(_owner, _hash, currentOpenBatch);

        if(horseId == 0) return horseId;

        horsesForGen[currentOpenBatch] = horsesForGen[currentOpenBatch].sub(1);

        return horseId;
    }

    function horsesRemaining(uint256 _gen) public view returns(uint256) {
        return horsesForGen[_gen];
    }
}