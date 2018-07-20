const Auctions = artifacts.require("./Auctions.sol");

module.exports = deployer => {
  deployer.deploy(Auctions);
}