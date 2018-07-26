const Auctions = artifacts.require("./Auctions.sol");
const CToken = artifacts.require("./CToken.sol");

module.exports = deployer => {
  deployer.deploy(Auctions, CToken.address);
}