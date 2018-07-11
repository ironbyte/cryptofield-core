const Auctions = artifacts.require("./Auctions.sol");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(Auctions);
}