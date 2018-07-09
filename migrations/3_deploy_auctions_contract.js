const Auctions = artifacts.require("./Auctions.sol");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(Auctions, { from: accounts[0], value: 500000000000000000 });
}