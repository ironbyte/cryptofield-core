const Auctions = artifacts.require("./Auctions.sol");

module.exports = (deployer, network, acc) => {
  if(process.env.NODE_ENV === "production"|| process.env.NODE_ENV === "testnet") {
    deployer.deploy(Auctions);
  } else {
    deployer.deploy(Auctions, {from: acc[1]});
  }
}
