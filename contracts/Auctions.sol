pragma solidity ^0.4.2;

import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract Auctions is usingOraclize {
  bytes32[] ids;

  event Response(bytes32 id, string result);

  constructor() public payable {
    OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
  }

  function start() public payable {
    oraclize_query("URL", "json(https://228cafa0.ngrok.io/generator/generate_horse).horse_type");
  }

  function __callback(bytes32 _id, string _result) {
    // require(msg.sender == oraclize_cbAddress());

    ids.push(_id);

    emit Response(_id, _result);
  }

  function getIds() public returns(bytes32[]) {
    return ids;
  }

  function fund() public payable {}
}